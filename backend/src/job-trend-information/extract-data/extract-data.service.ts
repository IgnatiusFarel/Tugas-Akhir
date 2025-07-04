import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { createObjectCsvStringifier } from 'csv-writer';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ScraperGateway } from "./scraper.gateway";
import { Subscription } from 'rxjs';
import { Response } from 'express';
import { CronJob } from 'cron';

@Injectable()
export class ExtractDataService {
  private readonly logger = new Logger(ExtractDataService.name);
  private scrapeResultSubscription: Subscription;
  private scrapeDoneSubscription: Subscription;
  private scrapeErrorSubscription: Subscription;
  private disconnectSubscription: Subscription;
  private activeSessions: { [source: string]: string } = {};
  private loadingSubscription: Subscription;

  constructor(
    private prisma: PrismaService,
    private readonly scraperGateway: ScraperGateway,
    private schedulerRegistry: SchedulerRegistry
  ) { this.setupSubscriptions(); this.initializeScheduledScrape(); }

  private readonly pagesPerSource: Record<string, number> = {
    jobstreet: 1,
    glints: 1
  }

  private async saveJobData(sessionId: string, source: string, jobs: any[]) {
    if (!jobs || jobs.length === 0) {
      this.logger.warn("Tidak ada pekerjaan untuk disimpan");
      return;
    }

    try {
      const jobsToCreate = jobs.map(job => ({
        scrape_session_id: sessionId,
        created_at: new Date(),
        job_title: job.Title || "",
        job_category: job.Category || "",
        job_sub_category: job["Sub Category"] || "",
        job_posted: job["Job Posted"] ? new Date(job["Job Posted"]) : new Date(),
        job_work_type: job["Work Type"] || "",
        // job_salary: job.Salary || "",
        job_min_salary: job["Min Salary"] || "",
        job_max_salary: job["Max Salary"] || "",
        job_source: source as any,
        // job_location: job.Location || "",
        job_city: job["City"] || "", 
        job_province: job["Province"] || "",
        job_detail_url: job["URL Detail"] || ""
      }));

      await this.prisma.$transaction(async (prisma) => {
        const batchSize = 100;
        for (let i = 0; i < jobsToCreate.length; i += batchSize) {
          const batch = jobsToCreate.slice(i, i + batchSize);
          await prisma.job_trend_information.createMany({
            data: batch,
          });
        }
      });

      this.logger.log(`Menyimpan ${jobsToCreate.length} pekerjaan untuk session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error menyimpan data pekerjaan: ${error}`);
      throw new InternalServerErrorException("Gagal menyimpan data pekerjaan");
    }
  }

  private setupSubscriptions() {
    this.disconnectSubscription = this.scraperGateway.onPythonServerDisconnected(async () => {
      this.logger.warn('Python server disconnected. Updating active sessions to failed status');
      try {
        const activeSources = Object.keys(this.activeSessions);

        if (activeSources.length > 0) {
          for (const source of activeSources) {
            const sessionId = this.activeSessions[source];
            const last = this.scraperGateway['lastHeartbeatTimestamps'][source] || 0;
            const now = Date.now();
            const elapsed = now - last;

            if (elapsed < 120000) {
              this.logger.warn(`⚠️ Heartbeat dari ${source} masih baru (${Math.floor(elapsed / 1000)} detik lalu), SKIP update failed.`);
              continue;
            }

            await this.prisma.scrape_session.update({
              where: { scrape_session_id: sessionId },
              data: {
                finished_at: new Date(),
                status: 'failed',
              },
            });

            this.logger.log(`Updated session ${sessionId} for source ${source} to failed status`);
            delete this.activeSessions[source];
          }
        }
      } catch (error) {
        this.logger.error(`Error updating sessions after disconnect: ${error.message}`);
      }
    });

    this.loadingSubscription = this.scraperGateway.onLoading(async (data) => {
      const { source, percentage, sessionId } = data;

      if (!sessionId || percentage === undefined) {
        return;
      }

      try {
        await this.prisma.scrape_session.update({
          where: { scrape_session_id: sessionId },
          data: { percentage },
        });
      } catch (error) {
        this.logger.error(`Error mengupdate progress session: ${error.message}`);
      }
    });

    this.scrapeDoneSubscription = this.scraperGateway.onScrapeDone(async (data) => {
      const { source, sessionId, jobs } = data;

      if (!sessionId) {
        this.logger.error(`Tidak ada sessionId dalam event scrape_done`);
        return;
      }

      try {
        await this.prisma.scrape_session.update({
          where: { scrape_session_id: sessionId },
          data: {
            finished_at: new Date(),
            status: 'success',
            percentage: 100,
          },
        });

        delete this.activeSessions[source];
      } catch (error) {
        this.logger.error(`Error mengupdate status session: ${error}`);
      }
    });

    this.scrapeErrorSubscription = this.scraperGateway.onScrapeError(async (data) => {
      const { source, sessionId, message } = data;

      if (!sessionId) {
        this.logger.error(`Tidak ada sessionId dalam event scrape_error`);
        return;
      }

      try {
        await this.prisma.scrape_session.update({
          where: { scrape_session_id: sessionId },
          data: {
            finished_at: new Date(),
            status: 'failed',
          },
        });

        delete this.activeSessions[source];
      } catch (error) {
        this.logger.error(`Error mengupdate session yang gagal: ${error}`);
      }
    });

    this.scrapeResultSubscription = this.scraperGateway.onScrapeResult(async (data) => {
      const { source, jobs, sessionId } = data;

      if (!sessionId || !jobs) {
        this.logger.error(`Data hasil scraping tidak valid: tidak ada sessionId atau jobs`);
        return;
      }

      this.logger.log(`Menerima ${jobs.length} pekerjaan dari ${source}, session ${sessionId}`);

      try {
        await this.saveJobData(sessionId, source, jobs);
      } catch (error) {
        this.logger.error(`Error menyimpan data pekerjaan: ${error}`);
      }
    });
  }

  async runScraping(source: string) {
    if (!this.scraperGateway.getPythonServerStatus()) {
      throw new ConflictException('Server python tidak aktif!');
    }

    const isAlreadyRunning = await this.scraperGateway.isScraping(source);
    if (isAlreadyRunning) {
      this.logger.warn(`Scraping sudah berjalan untuk sumber: ${source}`);
      throw new ConflictException(`Proses scraping untuk ${source} sudah berjalan.`);
    }

    try {
      const scrapeSession = await this.prisma.scrape_session.create({
        data: {
          status: 'running',
          started_at: new Date(),
          finished_at: new Date(),
          percentage: 0,
          source: source as any,
        }
      });
      const totalPages = this.pagesPerSource[source] || 10;
      this.logger.log(`Membuat sesi scraping: ${scrapeSession.scrape_session_id}`);
      this.activeSessions[source] = scrapeSession.scrape_session_id;
      this.scraperGateway.requestScraping({
        action: "scrape",
        total_pages: totalPages,
        source,
        sessionId: scrapeSession.scrape_session_id
      });

      return {
        status: "success",
        message: `Proses scraping untuk ${source} dimulai`,
        scrape_session_id: scrapeSession.scrape_session_id
      };
    } catch (error) {
      this.logger.error(`Error memulai scraping: ${error}`);
      throw new InternalServerErrorException("Gagal memulai scraping");
    }
  }

  async runScheduleScraping(data: { source: string; scheduledTime: Date }) {
    try {
      const now = new Date();
      if (data.scheduledTime <= now) {
        throw new Error('Scheduled time must be in the future')
      }

      const existingSchedule = await this.prisma.scrape_session.findFirst({
        where: {
          source: data.source as any,
          status: 'scheduled',
          scheduled_run: { not: null }
        }
      });

      if (existingSchedule) {
        throw new ConflictException(`Sudah ada jadwal scraping untuk ${data.source}. Hapus jadwal yang ada terlebih dahulu.`);
      }

      const scheduleScraping = await this.prisma.scrape_session.create({
        data: {
          source: data.source as any,
          status: 'scheduled',
          scheduled_run: data.scheduledTime,
          percentage: 0,
          started_at: new Date(),
          finished_at: new Date()
        }
      });

      this.scheduleJob(scheduleScraping.scrape_session_id, data.source, data.scheduledTime);

      return {
        status: 'success',
        message: `Scraping untuk ${data.source} dijadwalkan pada ${data.scheduledTime.toLocaleString()}`,
        data: scheduleScraping
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating scheduled scraping: ${error.message}`);
      throw new InternalServerErrorException("Gagal membuat schedule scraping");
    }
  }

  async getScheduledScraping(source?: string) {
    try {
      const where: any = { status: 'scheduled' };
      if (source) {
        where.source = source;
      }

      const schedules = await this.prisma.scrape_session.findMany({
        where,
        orderBy: { scheduled_run: 'asc' }
      });

      return {
        status: 'success',
        message: 'Jadwal scraping berhasil diambil',
        data: schedules
      };
    } catch (error) {
      this.logger.error(`Error fetching scheduled scraping: ${error.message}`);
      throw new InternalServerErrorException("Gagal mengambil jadwal scraping");
    }
  }

  async deleteScheduledScraping(id: string) {
    try {
      const schedule = await this.prisma.scrape_session.findUnique({
        where: { scrape_session_id: id }
      });

      if (!schedule) {
        throw new NotFoundException(`Jadwal scraping dengan ID ${id} tidak ditemukan`);
      }

      if (schedule.status !== 'scheduled') {
        throw new ConflictException('Hanya jadwal yang belum dijalankan yang dapat dihapus');
      }

      await this.prisma.scrape_session.delete({
        where: { scrape_session_id: id }
      });

      try {
        this.schedulerRegistry.deleteCronJob(id);
      } catch (error) {
        console.log(error)
      }

      return {
        status: 'success',
        message: 'Jadwal scraping berhasil dihapus',
        data: { id }
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error deleting scheduled scraping: ${error.message}`);
      throw new InternalServerErrorException("Gagal menghapus jadwal scraping");
    }
  }

  private async initializeScheduledScrape() {
    try {
      const scheduledJobs = await this.prisma.scrape_session.findMany({
        where: {
          status: 'scheduled',
          scheduled_run: {
            gt: new Date()
          }
        }
      });
      for (const job of scheduledJobs) {
        if (job.scheduled_run) {
          this.scheduleJob(job.scrape_session_id, job.source as string, job.scheduled_run);
          this.logger.log(`Initialized scheduled job: ${job.scrape_session_id} for ${job.source} at ${job.scheduled_run}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error initializing scheduled jobs: ${error.message}`);
    }
  }

  private scheduleJob(id: string, source: string, scheduledTime: Date) {
    const job = new CronJob(scheduledTime, async () => {
      this.logger.log(`Executing scheduled scraping job: ${id} for ${source}`);
      try {
        await this.prisma.scrape_session.update({
          where: { scrape_session_id: id },
          data: {
            status: 'running',
            started_at: new Date()
          }
        });
        this.activeSessions[source] = id;
        this.scraperGateway.requestScraping({
          action: "scrape",
          source,
          sessionId: id
        });
      } catch (error) {
        this.logger.error(`Failed to execute scheduled scraping: ${error.message}`);
        await this.prisma.scrape_session.update({
          where: { scrape_session_id: id },
          data: {
            status: 'failed',
            finished_at: new Date()
          }
        });
      }
    });
    this.schedulerRegistry.addCronJob(id, job);
    job.start();
    this.logger.log(`Scheduled scraping job: ${id} for ${source} at ${scheduledTime}`);
  }

  async getRecentScrapeSessions(params: {
    page?: number,
    pageSize?: number,
    source?: string,
  }) {
    const { page = 1, pageSize = 10, source } = params;
    const skip = (page - 1) * pageSize;
    const take = +pageSize;

    try {
      const where: any = {};
      if (source) {
        where.source = source;
      }

      const totalData = await this.prisma.scrape_session.count({ where });
      const totalPages = Math.ceil(totalData / pageSize);
      const scrapeSessions = await this.prisma.scrape_session.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: { job_trends_information: true }
          }
        }
      });

      return {
        status: "success",
        message: "Scrape session data berhasil diambil",
        totalData: +totalData,
        totalPages: +totalPages,
        currentPage: +page,
        size: +pageSize,
        data: scrapeSessions
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Gagal mengambil data scrape session");
    }
  }

  async exportJobsToJson(sessionId: string, res: Response) {
    try {
      const jobsData = await this.prisma.job_trend_information.findMany({
        where: { scrape_session_id: sessionId }
      });

      if (!jobsData.length) {
        throw new NotFoundException(`No Jobs Data found for session ID: ${sessionId}`);
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=jobs_${sessionId}.json`);
      return res.send(jobsData);
    } catch (error) {
      this.logger.error(`Error exporting jobs to JSON: ${error.message}`);
      throw new InternalServerErrorException("Failed to export jobs to JSON");
    }
  }

  async exportJobsToCsv(sessionId: string, res: Response) {
    try {
      const jobsData = await this.prisma.job_trend_information.findMany({
        where: { scrape_session_id: sessionId }
      });

      if (!jobsData.length) {
        throw new NotFoundException(`No jobs found for session ID: ${sessionId}`);
      }

      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: 'job_trend_information_id', title: 'Job Trend Information ID' },
          { id: 'job_posted', title: 'Date Posted' },
          { id: 'job_title', title: 'Job Title' },
          { id: 'job_sub_category', title: 'Sub Category' },
          { id: 'job_category', title: 'Category' },
          { id: 'job_work_type', title: 'Work Type' },
          { id: 'job_min_salary', title: 'Min Salary' },
          { id: 'job_max_salary', title: 'Max Salary' },
          { id: 'job_source', title: 'Source' },
          { id: 'job_location', title: 'Location' },
          { id: 'job_detail_url', title: 'Detail URL' },
        ]
      });

      const csvHeader = csvStringifier.getHeaderString();
      const csvRows = csvStringifier.stringifyRecords(jobsData);
      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=jobs_${sessionId}.csv`);
      return res.send(csvContent);
    } catch (error) {
      this.logger.error(`Error exporting jobs to CSV: ${error.message}`);
      throw new InternalServerErrorException("Failed to export jobs to CSV");
    }
  }

  async getJobsTrendInformationBySessionId(sessionId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;
    const take = +pageSize;

    try {
      const totalData = await this.prisma.job_trend_information.count({
        where: { scrape_session_id: sessionId }
      });

      const totalPages = Math.ceil(totalData / pageSize);
      const jobsData = await this.prisma.job_trend_information.findMany({
        where: { scrape_session_id: sessionId },
        skip, take,
        orderBy: { created_at: 'desc' }
      });

      return {
        status: "success",
        message: "Job data retrieved successfully",
        totalData,
        totalPages,
        currentPage: +page,
        size: +pageSize,
        data: jobsData
      };
    } catch (error) {
      this.logger.error(`Error retrieving job data for session ${sessionId}: ${error.message}`);
      throw new InternalServerErrorException("Failed to retrieve job data");
    }
  }
}
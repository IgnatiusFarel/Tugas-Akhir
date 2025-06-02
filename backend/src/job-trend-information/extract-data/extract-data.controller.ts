import { Body, Controller, Delete, Get, Param, Post, Query, Res } from "@nestjs/common";
import { ExtractDataService } from "./extract-data.service";
import { ScraperGateway } from "./scraper.gateway";
import { Response } from 'express';

@Controller('extract-data')
export class ExtractDataController {
  constructor(private readonly extractDataService: ExtractDataService,
    private readonly scraperGateway: ScraperGateway
  ) {}

  @Get('server-status')
  getServerStatus() {
    const isConnected = this.scraperGateway.getPythonServerStatus();
    return { isConnected };
  }

  @Post('run/:source')
  async runScraping(@Param('source') source: string) {
    return await this.extractDataService.runScraping(source);
  }

  @Post('run-schedule')
  async runScheduleScraping(@Body() data: {source: string, scheduledTime: string}) {
    return await this.extractDataService.runScheduleScraping({
      source: data.source,
      scheduledTime: new Date(data.scheduledTime),
    });
  }

  @Get('run-schedule')
  async getScheduledScraping(@Query('source') source?: string) {
    return await this.extractDataService.getScheduledScraping(source);
  }
  
  @Delete('run-schedule/:id')
  async deleteScheduledScraping(@Param('id') id: string) {
    return await this.extractDataService.deleteScheduledScraping(id);
  }

  @Get('scrape-sessions')
  async getRecentScrapeSessions(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('source') source?: string,
  ) {
    return await this.extractDataService.getRecentScrapeSessions({
      page,
      pageSize,
      source
    });
  }

  @Get(':sessionId')
  async getJobsTrendInformationBySessionId(
    @Param('sessionId') sessionId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return await this.extractDataService.getJobsTrendInformationBySessionId(sessionId, { page, pageSize });
  }

  @Get(':sessionId/download/json')
  async exportJobsToJson(
    @Param('sessionId') sessionId: string,
    @Res() res: Response
  ) {
    return await this.extractDataService.exportJobsToJson(sessionId, res);
  }

  @Get(':sessionId/download/csv')
  async exportJobsToCsv(
    @Param('sessionId') sessionId: string,
    @Res() res: Response
  ) {
    return await this.extractDataService.exportJobsToCsv(sessionId, res);
  }

}
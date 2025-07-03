import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UpdateScrapeConfigDto } from "./dto/update-scrape-config.dto";
import { scrape_source, scrape_rule } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ScrapeConfigService {
  constructor(private prisma: PrismaService) { }

  async getConfigElement(platform?: scrape_source): Promise<{ status: string; message: string; data: scrape_rule[] }> {
    try {
      const where = platform ? { platform } : {};
      const rules = await this.prisma.scrape_rule.findMany({
        where,
        orderBy: { field_name: 'asc' }
      });

      return {
        status: 'success',
        message: 'Scrape rules fetched successfully',
        data: rules,
      };

    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch scrape rules');
    }

  }

  async getConfigElementById(id: string): Promise<{ status: string; message: string; data: scrape_rule }> {
    try {
      const rule = await this.prisma.scrape_rule.findUnique({
        where: { scrape_rule_id: id },
      });

      if (!rule) {
        throw new NotFoundException(`Scrape rule with ID ${id} not found`);
      }

      return {
        status: 'success',
        message: 'Scrape rule fetched successfully',
        data: rule
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch scrape rule');
    }
  }

  async updateConfigElement(id: string, data: UpdateScrapeConfigDto): Promise<{ status: string; message: string; data: scrape_rule }> {
    const hasAtLeastOneValue = Object.values(data).some((value) => value !== undefined && value !== null);

    if (!hasAtLeastOneValue) {
      throw new BadRequestException('No valid fields provided for update.');
    }

    try {
      const existingRule = await this.prisma.scrape_rule.findUnique({
        where: { scrape_rule_id: id },
      });

      if (!existingRule) {
        throw new NotFoundException(`Scrape rule with ID ${id} not found`);
      }

      const updated = await this.prisma.scrape_rule.update({
        where: { scrape_rule_id: id },
        data,
      });

      return {
        status: 'success',
        message: 'Scrape rule updated successfully',
        data: updated,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update scrape rule');
    }
  }
}
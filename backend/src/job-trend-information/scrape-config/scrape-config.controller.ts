import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ScrapeConfigService } from "./scrape-config.service";
import { scrape_source } from "@prisma/client";
import { UpdateScrapeConfigDto } from "./dto/update-scrape-config.dto";

@Controller('scrape-config')
export class ScrapeConfigController {
    constructor(private readonly scrapeConfigService: ScrapeConfigService) {}

    @Get()
    async get(@Query('platform') platform?: scrape_source) {
        return this.scrapeConfigService.getConfigElement(platform);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.scrapeConfigService.getConfigElementById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateScrapeConfigDto) {
        return this.scrapeConfigService.updateConfigElement(id, dto); 
    }

    
}
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ExtractDataModule } from './job-trend-information/extract-data/extract-data.module';
import { DataCollectionModule } from './job-trend-information/data-collection/data-collection.module';
import { DataVisualizationModule } from './job-trend-information/data-visualization/data-visualization.module';
import { ScrapeConfigModule } from './job-trend-information/scrape-config/scrape-config.module';

@Module({
  imports: [ExtractDataModule, DataCollectionModule, DataVisualizationModule, ScrapeConfigModule, PrismaModule], 
})
export class AppModule {}

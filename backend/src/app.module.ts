import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ExtractDataModule } from './job-trend-information/extract-data/extract-data.module';
import { DataCollectionModule } from './job-trend-information/data-collection/data-collection.module';
import { DataVisualizationModule } from './job-trend-information/data-visualization/data-visualization.module';

@Module({
  imports: [ExtractDataModule, DataCollectionModule, DataVisualizationModule, PrismaModule], 
})
export class AppModule {}

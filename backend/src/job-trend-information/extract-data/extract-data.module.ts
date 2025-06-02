import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ExtractDataService } from "./extract-data.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ScraperGateway } from "./scraper.gateway";
import { ExtractDataController } from "./extract-data.controller";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
    imports: [PrismaModule, ScheduleModule.forRoot()],
    controllers: [ExtractDataController],
    providers: [ExtractDataService, PrismaService, ScraperGateway],
})

export class ExtractDataModule{}
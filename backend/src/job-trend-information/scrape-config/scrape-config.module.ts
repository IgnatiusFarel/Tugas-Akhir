import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ScrapeConfigController } from "./scrape-config.controller";
import { ScrapeConfigService } from "./scrape-config.service";

@Module({
    imports: [PrismaModule],
    controllers: [ScrapeConfigController],
    providers: [ScrapeConfigService],
})

export class ScrapeConfigModule{}

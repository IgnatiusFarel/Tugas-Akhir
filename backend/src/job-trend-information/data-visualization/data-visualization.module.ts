import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { DataVisualizationController } from "./data-visualization.controller";
import { DataVisualizationService } from "./data-visualization.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    imports: [PrismaModule],
    controllers: [DataVisualizationController],
    providers: [DataVisualizationService, PrismaService],
})
 
export class DataVisualizationModule{}
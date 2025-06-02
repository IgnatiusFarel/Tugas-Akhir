import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { DataCollectionController } from "./data-collection.controller";
import { DataCollectionService } from "./data-collection.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    imports: [PrismaModule],
    controllers: [DataCollectionController],
    providers: [DataCollectionService, PrismaService]
})

export class DataCollectionModule{}
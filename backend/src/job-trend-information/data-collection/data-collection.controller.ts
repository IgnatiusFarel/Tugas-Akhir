import { Controller, Get, Query } from "@nestjs/common";
import { DataCollectionService } from "./data-collection.service";

@Controller('data-collection')
export class DataCollectionController {
  constructor(private readonly dataCollectionService: DataCollectionService) { }

  @Get()
  async getAllJobsTrendInformation(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('source') source?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    return await this.dataCollectionService.getAllJobsTrendInformation({
      page,
      pageSize,
      source,
      search,
      sortBy,
      sortOrder
    });
  }
}
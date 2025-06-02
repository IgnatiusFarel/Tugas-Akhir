import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DataCollectionService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async getAllJobsTrendInformation(params: {
      page?: number,
      pageSize?: number,
      source?: string,
      search?: string,
      sortBy?: string, 
      sortOrder?: 'asc' | 'desc'
    }) {
      const { page = 1, pageSize = 10, source, search, sortBy='created_at', sortOrder = 'desc' } = params;
      const skip = (page - 1) * pageSize;
      const take = +pageSize;
    
      try {         
        const where: any = {};        
        if (search) {
          where.OR = [
            { job_title: { contains: search } },
            { job_category: { contains: search } },
            { job_sub_category: { contains: search } },
            { job_location: { contains: search } },
            { job_salary: { contains: search } }
          ];
        }
        if (source) { where.job_source = source;  }
        const totalData = await this.prisma.job_trend_information.count({ where });
        const totalPages = Math.ceil(totalData / pageSize);
        
        const jobTrendInformationData = await this.prisma.job_trend_information.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder
          },
        });
        
        return {
          status: "success",
          message: "Job Trend Information data retrieved successfully",
          totalData: +totalData,
          totalPages: +totalPages,
          currentPage: +page,
          size: +pageSize,
          data: jobTrendInformationData
        };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException("Failed to retrieve job trend information data");
      }
    }  
}
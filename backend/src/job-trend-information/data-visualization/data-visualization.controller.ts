import { Controller, Get, Query } from "@nestjs/common";
import { DataVisualizationService } from "./data-visualization.service";

@Controller('data-visualization')
export class DataVisualizationController {
    constructor(
        private readonly dataVisualizationService: DataVisualizationService
    ) { }

    @Get('job-categories')
    async getJobCategoriesChart(
        @Query('source') source: string,
        @Query('year') year?: number,
        @Query('month') month?: number,
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobCategoriesChart({
            source,
            year,
            month,
        });
    }

    @Get('job-work-types')
    async getJobWorkTypesChart(
        @Query('source') source: string,
        @Query('year') year?: number,
        @Query('month') month?: number
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobWorkTypesChart({
            source,
            year,
            month
        });
    }

    @Get('job-sub-categories')
    async getJobSubCategoriesChart(
        @Query('source') source: string,
        @Query('year') year?: number,
        @Query('month') month?: number
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobSubCategoriesChart({
            source,
            year,
            month
        });
    }

    @Get('job-salaries')
    async getJobSalariesChart(
        @Query('source') source: string,
        @Query('year') year?: number,
        @Query('month') month?: number
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobSalariesChart({
            source,
            year,
            month
        });
    }

    @Get('job-locations')
    async getJobLocationsChart(
        @Query('source') source: string,
        @Query('year') year?: number,
        @Query('month') month?: number
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobLocationsChart({
            source,
            year,
            month
        });
    }

}

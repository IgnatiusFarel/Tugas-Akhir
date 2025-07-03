import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from "@nestjs/common";
import { DataVisualizationService } from "./data-visualization.service";

@Controller('data-visualization')
export class DataVisualizationController {
    constructor(
        private readonly dataVisualizationService: DataVisualizationService
    ) {}

    @Get('job-categories')
    async getJobCategoriesChart(
        @Query('source') source: string,
        @Query('year', new DefaultValuePipe(undefined), ParseIntPipe) year?: number,
        @Query('month', new DefaultValuePipe(undefined), ParseIntPipe) month?: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 5,
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobCategoriesChart({
            source, year, month, limit,
        });
    }

    @Get('job-sub-categories')
    async getJobSubCategoriesChart(
        @Query('source') source: string,
        @Query('year', new DefaultValuePipe(undefined), ParseIntPipe) year?: number,
        @Query('month', new DefaultValuePipe(undefined), ParseIntPipe) month?: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 5,
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobSubCategoriesChart({
            source, year, month, limit,
        });
    }

    @Get('job-work-types')
    async getJobWorkTypesChart(
        @Query('source') source: string,
        @Query('year', new DefaultValuePipe(undefined), ParseIntPipe) year?: number,
        @Query('month', new DefaultValuePipe(undefined), ParseIntPipe) month?: number,
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobWorkTypesChart({
            source, year, month
        }); 
    }

    @Get('job-salaries')
    async getJobSalariesChart(
        @Query('source') source: string,
        @Query('year', new DefaultValuePipe(undefined), ParseIntPipe) year?: number,
        @Query('month', new DefaultValuePipe(undefined), ParseIntPipe) month?: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 5,
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }

        return await this.dataVisualizationService.getJobSalariesChart({
            source, year, month, limit,
        });
    }

    @Get('job-locations')
    async getJobLocationsChart(
        @Query('source') source: string,
        @Query('year', new DefaultValuePipe(undefined), ParseIntPipe) year?: number,
        @Query('month', new DefaultValuePipe(undefined), ParseIntPipe) month?: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 5,
    ) {
        if (!source) {
            return { status: 'error', message: 'Source required', data: null };
        }
        return await this.dataVisualizationService.getJobLocationsChart({
            source, year, month, limit,
        });
    }
}

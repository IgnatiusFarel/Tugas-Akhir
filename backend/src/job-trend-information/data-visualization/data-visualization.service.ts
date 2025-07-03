import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DataVisualizationService {
    constructor(
        private prisma: PrismaService
    ) {}

    async getJobCategoriesChart(params: {
        source: string;
        year?: number;
        month?: number;
        limit?: number;
    }) {
        const { source, year, month, limit } = params;
        const take = limit ?? 5;

        try {
            let dateFilter = {};

            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate,
                    }
                };
            } else if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate
                    }
                };
            }

            const jobCategoryChartData = await (this.prisma.job_trend_information.groupBy as any)({
                by: ['job_category'],
                where: {
                    job_source: source,
                    ...dateFilter
                },
                _count: {
                    job_trend_information_id: true
                },
                orderBy: {
                    _count: {
                        job_trend_information_id: 'desc'
                    }
                },
                take, 
            });

            const chartData = {
                labels: jobCategoryChartData.map(item => item.job_category || ''),
                values: jobCategoryChartData.map(item => item._count.job_trend_information_id),
                dataset: jobCategoryChartData.map(item => ({
                    category: item.job_category || '',
                    amount: item._count.job_trend_information_id
                }))
            };

            return {
                status: 'success',
                message: `Job category chart data for ${source} retrieved successfully`,
                data: chartData
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve job category chart data');
        }
    }

    async getJobSubCategoriesChart(params: {
        source: string;
        year?: number;
        month?: number;
        limit?: number;
    }) {
        const { source, year, month, limit } = params;
        const take = limit ?? 5;

        try {
            let dateFilter = {};

            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate,
                    }
                };
            } else if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate
                    }
                };
            }

            const jobSubCategoryChartData = await (this.prisma.job_trend_information.groupBy as any)({
                by: ['job_sub_category'],
                where: {
                    job_source: source,
                    ...dateFilter
                },
                _count: {
                    job_trend_information_id: true
                },
                orderBy: {
                    _count: {
                        job_trend_information_id: 'desc'
                    }
                },
                take, 
            })

            const chartData = {
                labels: jobSubCategoryChartData.map(item => item.job_sub_category || ''),
                values: jobSubCategoryChartData.map(item => item._count.job_trend_information_id),
                dataset: jobSubCategoryChartData.map(item => ({
                    subCategory: item.job_sub_category || '',
                    amount: item._count.job_trend_information_id
                }))
            };

            return {
                status: 'success',
                message: `Job sub category chart data for ${source} retrieved successfully`,
                data: chartData
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve job sub category chart data');
        }
    }

    async getJobWorkTypesChart(params: {
        source: string;
        year?: number;
        month?: number;
    }) {
        const { source, year, month } = params

        try {
            let dateFilter = {};

            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate,
                    }
                };
            } else if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate
                    }
                };
            }

            const jobWorkTypeChartData = await (this.prisma.job_trend_information.groupBy as any)({
                by: ['job_work_type'],
                where: {
                    job_source: source,
                    ...dateFilter
                },
                _count: {
                    job_trend_information_id: true
                },
                orderBy: {
                    _count: {
                        job_trend_information_id: 'desc'
                    }
                },
            })

            const chartData = {
                labels: jobWorkTypeChartData.map(item => item.job_work_type || ''),
                values: jobWorkTypeChartData.map(item => item._count.job_trend_information_id),
                dataset: jobWorkTypeChartData.map(item => ({
                    workType: item.job_work_type || '',
                    amount: item._count.job_trend_information_id
                }))
            };

            return {
                status: 'success',
                message: `Job work type chart data for ${source} retrieved successfully`,
                data: chartData
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve job work type chart data');
        }
    }

    async getJobSalariesChart(params: {
        source: string;
        year?: number;
        month?: number;
        limit?: number;
    }) {
       const { source, year, month, limit } = params;
        const take = limit ?? 5;

        try {
            let dateFilter = {};

            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate,
                    }
                };
            } else if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate
                    }
                };
            }

            const jobSalaryChartData = await (this.prisma.job_trend_information.groupBy as any)({
                by: ['job_salary'],
                where: {
                    job_source: source,
                    ...dateFilter,
                    job_salary: {
                        not: ''
                    }
                },
                _count: {
                    job_trend_information_id: true
                },
                orderBy: {
                    _count: {
                        job_trend_information_id: 'desc'
                    }
                },
                 take, 
            })

            const chartData = {
                labels: jobSalaryChartData.map(item => item.job_salary || ''),
                values: jobSalaryChartData.map(item => item._count.job_trend_information_id),
                dataset: jobSalaryChartData.map(item => ({
                    salary: item.job_salary || '',
                    amount: item._count.job_trend_information_id
                }))
            };

            return {
                status: 'success',
                message: `Job salary chart data for ${source} retrieved successfully`,
                data: chartData
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve job salary chart data');
        }
    }

    async getJobLocationsChart(params: {
        source: string;
        year?: number;
        month?: number;
        limit?: number; 
    }) {
        const { source, year, month, limit } = params;
        const take = limit ?? 5;

        try {
            let dateFilter = {};

            if (year && month) {
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate,
                    }
                };
            } else if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);

                dateFilter = {
                    job_posted: {
                        gte: startDate,
                        lte: endDate
                    }
                };
            }

            const jobLocationChartData = await (this.prisma.job_trend_information.groupBy as any)({
                by: ['job_location'],
                where: {
                    job_source: source,
                    ...dateFilter
                },
                _count: {
                    job_trend_information_id: true
                },
                orderBy: {
                    _count: {
                        job_trend_information_id: 'desc'
                    }
                },
                take
            })

            const chartData = {
                labels: jobLocationChartData.map(item => item.job_location || ''),
                values: jobLocationChartData.map(item => item._count.job_trend_information_id),
                dataset: jobLocationChartData.map(item => ({
                    location: item.job_location || '',
                    amount: item._count.job_trend_information_id
                }))
            };

            return {
                status: 'success',
                message: `Job location chart data for ${source} retrieved successfully`,
                data: chartData
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve job location chart data');
        }
    }
}
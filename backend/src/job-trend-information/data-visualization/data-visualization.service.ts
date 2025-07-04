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
                by: ['job_max_salary'],
                where: {
                    job_source: source,
                    ...dateFilter,
                    job_max_salary: {
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
                labels: jobSalaryChartData.map(item => item.job_max_salary || ''),
                values: jobSalaryChartData.map(item => item._count.job_trend_information_id),
                dataset: jobSalaryChartData.map(item => ({
                    salary: item.job_max_salary || '',
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

    async getJobCitiesChart(params: {
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

            const jobCityChartData = await (this.prisma.job_trend_information.groupBy as any)({
                by: ['job_city'],
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
                labels: jobCityChartData.map(item => item.job_city || ''),
                values: jobCityChartData.map(item => item._count.job_trend_information_id),
                dataset: jobCityChartData.map(item => ({
                    city: item.job_city || '',
                    amount: item._count.job_trend_information_id
                }))
            };

            return {
                status: 'success',
                message: `Job city chart data for ${source} retrieved successfully`,
                data: chartData
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve job city chart data');
        }
    }

    async getJobProvincesChart(params: {
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

            const jobProvinceChartData = await (this.prisma.job_trend_information.groupBy as any)({
                by: ['job_province'],
                where: {
                    job_source: source,
                    ...dateFilter,
                    job_province: {
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
                take
            })

            const chartData = {
                labels: jobProvinceChartData.map(item => item.job_province || ''),
                values: jobProvinceChartData.map(item => item._count.job_trend_information_id),
                dataset: jobProvinceChartData.map(item => ({
                    province: item.job_province|| '',
                    amount: item._count.job_trend_information_id
                }))
            };

            return {
                status: 'success',
                message: `Job province chart data for ${source} retrieved successfully`,
                data: chartData
            }
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve job province chart data');
        }
    }
}
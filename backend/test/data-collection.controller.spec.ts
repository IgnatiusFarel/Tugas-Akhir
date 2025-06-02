import { Test, TestingModule } from '@nestjs/testing';
import { DataCollectionController } from '../src/job-trend-information/data-collection/data-collection.controller';
import { DataCollectionService } from '../src/job-trend-information/data-collection/data-collection.service';
import { BadRequestException } from '@nestjs/common';

describe('DataCollectionController', () => {
  let controller: DataCollectionController;
  let service: DataCollectionService;

  // Mock data yang akan dikembalikan oleh service
  const mockJobData = [
    { id: 1, title: 'Software Engineer', source: 'linkedin' },
    { id: 2, title: 'Data Analyst', source: 'indeed' },
  ];

  const mockPaginationResult = {
    data: mockJobData,
    pagination: {
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }
  };

  beforeEach(async () => {
    // Buat modul testing dengan mock service
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataCollectionController],
      providers: [
        {
          provide: DataCollectionService,
          useValue: {
            getAllJobsTrendInformation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DataCollectionController>(DataCollectionController);
    service = module.get<DataCollectionService>(DataCollectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllJobsTrendInformation', () => {
    it('should call service with default parameters', async () => {
      // Setup mock service
      jest.spyOn(service, 'getAllJobsTrendInformation').mockResolvedValue(mockPaginationResult);

      // Panggil controller method
      const result = await controller.getAllJobsTrendInformation();

      // Verifikasi
      expect(service.getAllJobsTrendInformation).toHaveBeenCalledWith({
        page: undefined,
        pageSize: undefined,
        source: undefined,
        search: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
      
      expect(result).toEqual(mockPaginationResult);
    });

    it('should call service with all parameters', async () => {
      // Setup mock service
      jest.spyOn(service, 'getAllJobsTrendInformation').mockResolvedValue(mockPaginationResult);

      // Panggil controller method dengan semua parameter
      const result = await controller.getAllJobsTrendInformation(
        2, // page
        20, // pageSize
        'linkedin', // source
        'engineer', // search
        'title', // sortBy
        'asc' // sortOrder
      );

      // Verifikasi
      expect(service.getAllJobsTrendInformation).toHaveBeenCalledWith({
        page: 2,
        pageSize: 20,
        source: 'linkedin',
        search: 'engineer',
        sortBy: 'title',
        sortOrder: 'asc',
      });
      
      expect(result).toEqual(mockPaginationResult);
    });

    it('should handle invalid sortOrder parameter', async () => {
      // Panggil controller method dengan sortOrder tidak valid
      const test = async () => {
        await controller.getAllJobsTrendInformation(
          1,
          10,
          'linkedin',
          '',
          'title',
          'invalid' as any // sortOrder tidak valid
        );
      };

      // Verifikasi error yang diharapkan
      await expect(test).rejects.toThrow(BadRequestException);
      await expect(test).rejects.toThrow('Invalid sortOrder. Must be "asc" or "desc"');
    });

    it('should handle service errors', async () => {
      // Setup mock service untuk throw error
      const error = new Error('Database error');
      jest.spyOn(service, 'getAllJobsTrendInformation').mockRejectedValue(error);

      // Panggil controller method
      const test = async () => {
        await controller.getAllJobsTrendInformation();
      };

      // Verifikasi error dilempar
      await expect(test).rejects.toThrow(error);
    });

    it('should handle partial parameters', async () => {
      // Setup mock service
      jest.spyOn(service, 'getAllJobsTrendInformation').mockResolvedValue(mockPaginationResult);

      // Panggil controller method dengan beberapa parameter
      const result = await controller.getAllJobsTrendInformation(
        3, // page
        undefined, // pageSize
        'indeed', // source
        undefined, // search
        'source', // sortBy
        'desc' // sortOrder
      );

      // Verifikasi
      expect(service.getAllJobsTrendInformation).toHaveBeenCalledWith({
        page: 3,
        pageSize: undefined,
        source: 'indeed',
        search: undefined,
        sortBy: 'source',
        sortOrder: 'desc',
      });
      
      expect(result).toEqual(mockPaginationResult);
    });
  });
});
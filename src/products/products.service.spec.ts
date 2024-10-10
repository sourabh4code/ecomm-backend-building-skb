import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation(dto => dto),
      save: jest.fn().mockImplementation(product => Promise.resolve({ id: 'someId', ...product })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(true),
      delete: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = { name: 'Test Product', description: 'Test Description', price: 19.99, sku: 'TEST123', stockQuantity: 100 };
      expect(await service.create(dto)).toEqual({
        id: expect.any(String),
        ...dto,
      });
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      const product = { id: 'someId', name: 'Test Product' };
      mockRepository.findOne.mockResolvedValue(product);
      expect(await service.findOne('someId')).toEqual(product);
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistentId')).rejects.toThrow(NotFoundException);
    });
  });

  // Add more test cases for other methods (findAll, update, remove) here
});
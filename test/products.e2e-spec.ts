import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/products/entities/product.entity';
import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

interface ProductData {
  name: string;
  description: string;
  price: number;
  sku: string;
  stockQuantity: number;
}

type ProductWithId = ProductData & { id: string };

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let mockProductRepository: jest.Mocked<Partial<{
    create: (dto: ProductData) => ProductData;
    save: (product: ProductData) => Promise<ProductWithId>;
    find: () => Promise<ProductWithId[]>;
    findOne: () => Promise<ProductWithId | null>;
    update: () => Promise<{ affected?: number }>;
    delete: () => Promise<{ affected?: number }>;
  }>>;

  beforeEach(async () => {
    // Initialize mockProductRepository with proper typing
    mockProductRepository = {
      create: jest.fn((dto: ProductData) => dto),
      save: jest.fn((product: ProductData): Promise<ProductWithId> => Promise.resolve({ id: 'someId', ...product })),
      find: jest.fn((): Promise<ProductWithId[]> => Promise.resolve([])),
      findOne: jest.fn((): Promise<ProductWithId | null> => Promise.resolve(null)),
      update: jest.fn((): Promise<{ affected?: number }> => Promise.resolve({ affected: 1 })),
      delete: jest.fn((): Promise<{ affected?: number }> => Promise.resolve({ affected: 1 })),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Product))
      .useValue(mockProductRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/products (POST)', () => {
    const newProduct: ProductData = {
      name: 'Test Product',
      description: 'This is a test product',
      price: 19.99,
      sku: 'TEST123',
      stockQuantity: 100
    };

    return request(app.getHttpServer())
      .post('/products')
      .send(newProduct)
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Product');
      });
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect([]);
  });

  afterAll(async () => {
    await app.close();
  });
});

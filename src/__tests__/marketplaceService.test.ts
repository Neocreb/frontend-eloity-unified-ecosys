import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketplaceService } from '../services/marketplaceService';
import { Product } from '../types/marketplace';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
};

// Mock the supabase import
vi.mock('../lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('MarketplaceService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a physical product successfully', async () => {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Physical Product',
        description: 'A test physical product',
        price: 29.99,
        image: 'https://example.com/image.jpg',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        category: 'Electronics',
        subcategory: 'Smartphones',
        rating: 0,
        inStock: true,
        stockQuantity: 10,
        isFeatured: false,
        isSponsored: false,
        tags: ['electronics', 'smartphone'],
        sellerId: 'seller-123',
        sellerName: 'Test Seller',
        sellerAvatar: 'https://example.com/avatar.jpg',
        condition: 'new',
        brand: 'TestBrand',
        model: 'TestModel',
        weight: 1.5,
        dimensions: {
          length: 10,
          width: 5,
          height: 2,
          unit: 'cm'
        }
      };

      const mockResponse = {
        data: {
          id: 'product-123',
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller_id: productData.sellerId,
          image_url: productData.image,
          discount_price: null,
          currency: 'USD',
          category_id: null,
          subcategory_id: null,
          in_stock: productData.inStock,
          stock_quantity: productData.stockQuantity,
          is_featured: productData.isFeatured,
          is_sponsored: productData.isSponsored,
          boost_until: null,
          tags: productData.tags,
          condition: productData.condition,
          brand: productData.brand,
          model: productData.model,
          weight: productData.weight,
          rating: 0,
          review_count: 0,
          is_new: false
        },
        error: null
      };

      mockSupabase.insert.mockReturnValueOnce(mockSupabase);
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.single.mockResolvedValueOnce(mockResponse);

      const result = await MarketplaceService.createProduct(productData);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('product-123');
      expect(result?.name).toBe('Test Physical Product');
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should create a digital product with digital-specific fields', async () => {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Digital Product',
        description: 'A test digital product',
        price: 19.99,
        image: 'https://example.com/digital-image.jpg',
        images: ['https://example.com/digital-image1.jpg'],
        category: 'Books & Literature',
        subcategory: 'eBooks',
        rating: 0,
        inStock: true,
        stockQuantity: 1000,
        isFeatured: true,
        isSponsored: false,
        tags: ['ebook', 'fiction'],
        sellerId: 'seller-456',
        sellerName: 'Digital Seller',
        sellerAvatar: 'https://example.com/digital-avatar.jpg',
        condition: 'new',
        digitalType: 'ebook',
        format: 'pdf',
        fileSize: '2.5MB',
        authors: 'Test Author',
        publisher: 'Test Publisher',
        language: 'English',
        isDigital: true
      };

      const mockResponse = {
        data: {
          id: 'digital-product-123',
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller_id: productData.sellerId,
          image_url: productData.image,
          discount_price: null,
          currency: 'USD',
          category_id: null,
          subcategory_id: null,
          in_stock: productData.inStock,
          stock_quantity: productData.stockQuantity,
          is_featured: productData.isFeatured,
          is_sponsored: productData.isSponsored,
          boost_until: null,
          tags: productData.tags,
          condition: productData.condition,
          digital_type: productData.digitalType,
          format: productData.format,
          file_size: productData.fileSize,
          authors: productData.authors,
          publisher: productData.publisher,
          language: productData.language,
          rating: 0,
          review_count: 0,
          is_new: false
        },
        error: null
      };

      mockSupabase.insert.mockReturnValueOnce(mockSupabase);
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.single.mockResolvedValueOnce(mockResponse);

      const result = await MarketplaceService.createProduct(productData);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('digital-product-123');
      expect(result?.digitalType).toBe('ebook');
      expect(result?.format).toBe('pdf');
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
    });

    it('should create a service product with service-specific fields', async () => {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Service Product',
        description: 'A test service product',
        price: 49.99,
        image: 'https://example.com/service-image.jpg',
        images: ['https://example.com/service-image1.jpg'],
        category: 'Business & Productivity',
        subcategory: 'Consulting',
        rating: 0,
        inStock: true,
        stockQuantity: 10,
        isFeatured: false,
        isSponsored: true,
        tags: ['consulting', 'business'],
        sellerId: 'seller-789',
        sellerName: 'Service Provider',
        sellerAvatar: 'https://example.com/service-avatar.jpg',
        condition: 'new',
        serviceType: 'consulting',
        deliveryTime: '2-3 business days',
        hourlyRate: 25.00,
        requirements: 'Initial consultation required',
        isDigital: false
      };

      const mockResponse = {
        data: {
          id: 'service-product-123',
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          seller_id: productData.sellerId,
          image_url: productData.image,
          discount_price: null,
          currency: 'USD',
          category_id: null,
          subcategory_id: null,
          in_stock: productData.inStock,
          stock_quantity: productData.stockQuantity,
          is_featured: productData.isFeatured,
          is_sponsored: productData.isSponsored,
          boost_until: null,
          tags: productData.tags,
          condition: productData.condition,
          service_type: productData.serviceType,
          delivery_time: productData.deliveryTime,
          hourly_rate: productData.hourlyRate,
          requirements: productData.requirements,
          rating: 0,
          review_count: 0,
          is_new: false
        },
        error: null
      };

      mockSupabase.insert.mockReturnValueOnce(mockSupabase);
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.single.mockResolvedValueOnce(mockResponse);

      const result = await MarketplaceService.createProduct(productData);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('service-product-123');
      expect(result?.serviceType).toBe('consulting');
      expect(result?.deliveryTime).toBe('2-3 business days');
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
    });

    it('should handle errors when creating a product', async () => {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        image: 'https://example.com/image.jpg',
        images: ['https://example.com/image1.jpg'],
        category: 'Electronics',
        rating: 0,
        inStock: true,
        stockQuantity: 10,
        isFeatured: false,
        isSponsored: false,
        tags: ['electronics'],
        sellerId: 'seller-123',
        sellerName: 'Test Seller',
        sellerAvatar: 'https://example.com/avatar.jpg',
        condition: 'new'
      };

      const mockError = new Error('Database error');
      mockSupabase.insert.mockReturnValueOnce(mockSupabase);
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: mockError
      });

      const result = await MarketplaceService.createProduct(productData);

      expect(result).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const productId = 'product-123';
      const updates: Partial<Product> = {
        name: 'Updated Product Name',
        price: 39.99,
        digitalType: 'audio',
        serviceType: 'training'
      };

      const mockResponse = {
        data: {
          id: productId,
          name: 'Updated Product Name',
          price: 39.99,
          digital_type: 'audio',
          service_type: 'training',
          seller_id: 'seller-123',
          description: 'A test product',
          image_url: 'https://example.com/image.jpg',
          category: 'Electronics',
          in_stock: true,
          stock_quantity: 10,
          is_featured: false,
          is_sponsored: false,
          tags: ['electronics'],
          condition: 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          rating: 0,
          review_count: 0,
          is_new: false
        },
        error: null
      };

      mockSupabase.update.mockReturnValueOnce(mockSupabase);
      mockSupabase.eq.mockReturnValueOnce(mockSupabase);
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.single.mockResolvedValueOnce(mockResponse);

      const result = await MarketplaceService.updateProduct(productId, updates);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Product Name');
      expect(result?.price).toBe(39.99);
      expect(result?.digitalType).toBe('audio');
      expect(result?.serviceType).toBe('training');
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', productId);
    });

    it('should handle errors when updating a product', async () => {
      const productId = 'product-123';
      const updates: Partial<Product> = {
        name: 'Updated Product Name'
      };

      const mockError = new Error('Database error');
      mockSupabase.update.mockReturnValueOnce(mockSupabase);
      mockSupabase.eq.mockReturnValueOnce(mockSupabase);
      mockSupabase.select.mockReturnValueOnce(mockSupabase);
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: mockError
      });

      const result = await MarketplaceService.updateProduct(productId, updates);

      expect(result).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('products');
    });
  });
});
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const phoneSchema = z.string().regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number');
export const urlSchema = z.string().url('Invalid URL');

// User validation
export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

// Seller validation
export const sellerRegisterSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  storeSlug: z.string().min(2, 'Store slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Store slug can only contain lowercase letters, numbers, and hyphens'),
  storeDescription: z.string().optional(),
  businessEmail: emailSchema.optional(),
  businessPhone: phoneSchema.optional(),
  businessAddress: z.string().optional(),
});

// Product validation
export const productSchema = z.object({
  categoryId: z.number().int().positive(),
  brandId: z.number().int().positive().optional(),
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().min(2, 'Product slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Product slug can only contain lowercase letters, numbers, and hyphens'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  tags: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'out_of_stock']),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
});

// Order validation
export const orderSchema = z.object({
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  shippingCity: z.string().min(2, 'City is required'),
  shippingCountry: z.string().min(2, 'Country is required'),
  shippingPostalCode: z.string().min(3, 'Postal code is required'),
  paymentMethod: z.enum(['credit_card', 'paypal', 'stripe']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

// Review validation
export const reviewSchema = z.object({
  productId: z.number().int().positive(),
  orderId: z.number().int().positive().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10, 'Review must be at least 10 characters'),
});

// Coupon validation
export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters')
    .regex(/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers'),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().positive('Discount value must be positive'),
  minPurchase: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Banner validation
export const bannerSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  subtitle: z.string().optional(),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  linkUrl: z.string().url('Link URL must be a valid URL').optional(),
  position: z.enum(['hero', 'featured', 'promo', 'sidebar']),
  sortOrder: z.number().int().min(0).default(0),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any()
    .refine((file) => file instanceof File, 'File is required')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'File must be an image (JPEG, PNG, WebP, or GIF)'
    ),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating', 'newest', 'bestselling']).default('newest'),
});

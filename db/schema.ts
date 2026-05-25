import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ============================================
// USERS (extended from base auth schema)
// ============================================
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin", "seller"]).default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// SELLERS
// ============================================
export const sellers = mysqlTable("sellers", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  storeSlug: varchar("store_slug", { length: 255 }).notNull().unique(),
  storeDescription: text("store_description"),
  storeLogo: text("store_logo"),
  storeBanner: text("store_banner"),
  businessEmail: varchar("business_email", { length: 320 }),
  businessPhone: varchar("business_phone", { length: 20 }),
  businessAddress: text("business_address"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  totalSales: int("total_sales").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  documentsVerified: boolean("documents_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Seller = typeof sellers.$inferSelect;
export type InsertSeller = typeof sellers.$inferInsert;

// ============================================
// CATEGORIES
// ============================================
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  level: int("level").default(0),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ============================================
// BRANDS
// ============================================
export const brands = mysqlTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  website: varchar("website", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

// ============================================
// PRODUCTS
// ============================================
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).notNull(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }).notNull(),
  brandId: bigint("brand_id", { mode: "number", unsigned: true }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 12, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }),
  quantity: int("quantity").default(0).notNull(),
  soldCount: int("sold_count").default(0),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  weightUnit: varchar("weight_unit", { length: 10 }).default("kg"),
  tags: text("tags"),
  status: mysqlEnum("status", ["draft", "active", "inactive", "out_of_stock"]).default("draft").notNull(),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: int("review_count").default(0),
  viewCount: int("view_count").default(0),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  aiGeneratedDescription: text("ai_generated_description"),
  aiReviewSummary: text("ai_review_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ============================================
// PRODUCT IMAGES
// ============================================
export const productImages = mysqlTable("product_images", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  imageUrl: text("image_url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  sortOrder: int("sort_order").default(0),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

// ============================================
// PRODUCT VARIANTS
// ============================================
export const productVariants = mysqlTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  variantName: varchar("variant_name", { length: 255 }).notNull(),
  variantValue: varchar("variant_value", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  price: decimal("price", { precision: 12, scale: 2 }),
  quantity: int("quantity").default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

// ============================================
// CART ITEMS
// ============================================
export const cartItems = mysqlTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  variantId: bigint("variant_id", { mode: "number", unsigned: true }),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// ============================================
// ORDERS
// ============================================
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0.00"),
  shippingAmount: decimal("shipping_amount", { precision: 12, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  shippingAddress: text("shipping_address"),
  shippingCity: varchar("shipping_city", { length: 100 }),
  shippingCountry: varchar("shipping_country", { length: 100 }),
  shippingPostalCode: varchar("shipping_postal_code", { length: 20 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================
// ORDER ITEMS
// ============================================
export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).notNull(),
  variantName: varchar("variant_name", { length: 255 }),
  variantValue: varchar("variant_value", { length: 255 }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productImage: text("product_image"),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ============================================
// REVIEWS
// ============================================
export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  isVerified: boolean("is_verified").default(false),
  helpfulCount: int("helpful_count").default(0),
  aiSentiment: mysqlEnum("ai_sentiment", ["positive", "neutral", "negative"]),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================
// COUPONS
// ============================================
export const coupons = mysqlTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: mysqlEnum("discount_type", ["percentage", "fixed_amount"]).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("min_purchase", { precision: 12, scale: 2 }).default("0.00"),
  maxDiscount: decimal("max_discount", { precision: 12, scale: 2 }),
  usageLimit: int("usage_limit"),
  usageCount: int("usage_count").default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// ============================================
// WISHLISTS
// ============================================
export const wishlists = mysqlTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

// ============================================
// NOTIFICATIONS
// ============================================
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["order", "promotion", "system", "seller"]).default("system").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================
// BANNERS (CMS)
// ============================================
export const banners = mysqlTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  imageUrl: text("image_url").notNull(),
  linkUrl: varchar("link_url", { length: 500 }),
  position: mysqlEnum("position", ["hero", "featured", "promo", "sidebar"]).default("hero").notNull(),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

// ============================================
// AUDIT LOGS
// ============================================
export const auditLogs = mysqlTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================
// ANALYTICS
// ============================================
export const analytics = mysqlTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  metricType: mysqlEnum("metric_type", ["sales", "traffic", "conversion", "revenue", "users"]).notNull(),
  metricValue: decimal("metric_value", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  dimension: varchar("dimension", { length: 100 }),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

// ============================================
// AI CONVERSATIONS (Chatbot history)
// ============================================
export const aiConversations = mysqlTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  message: text("message").notNull(),
  intent: varchar("intent", { length: 100 }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AIConversation = typeof aiConversations.$inferSelect;
export type InsertAIConversation = typeof aiConversations.$inferInsert;

// ============================================
// RECENTLY VIEWED
// ============================================
export const recentlyViewed = mysqlTable("recently_viewed", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export type RecentlyViewed = typeof recentlyViewed.$inferSelect;
export type InsertRecentlyViewed = typeof recentlyViewed.$inferInsert;

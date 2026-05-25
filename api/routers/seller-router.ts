import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { sellers, products, productImages, orders, orderItems, users } from "@db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export const sellerRouter = createRouter({
  // Register as seller
  register: authedQuery
    .input(z.object({
      storeName: z.string().min(2).max(255),
      storeSlug: z.string().min(2).max(255),
      storeDescription: z.string().optional(),
      businessEmail: z.string().email().optional(),
      businessPhone: z.string().optional(),
      businessAddress: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check if already a seller
      const [existing] = await db
        .select()
        .from(sellers)
        .where(eq(sellers.userId, userId))
        .limit(1);

      if (existing) {
        throw new Error("You are already registered as a seller");
      }

      const [result] = await db.insert(sellers).values({
        userId,
        storeName: input.storeName,
        storeSlug: input.storeSlug,
        storeDescription: input.storeDescription,
        businessEmail: input.businessEmail,
        businessPhone: input.businessPhone,
        businessAddress: input.businessAddress,
        status: "pending",
      });

      // Update user role to seller
      await db
        .update(users)
        .set({ role: "seller" })
        .where(eq(users.id, userId));

      return { success: true, sellerId: Number(result.insertId) };
    }),

  // Get my seller profile
  me: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const [seller] = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, userId))
      .limit(1);

    return seller ?? null;
  }),

  // Get seller dashboard stats
  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const [seller] = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, userId))
      .limit(1);

    if (!seller) return null;

    const sellerId = seller.id;

    // Get total products
    const [productsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.sellerId, sellerId));

    // Get total orders
    const sellerOrderItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.sellerId, sellerId));

    const orderIds = [...new Set(sellerOrderItems.map(oi => oi.orderId))];

    // Calculate revenue
    const totalRevenue = sellerOrderItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

    // Get recent orders
    const recentOrderIds = orderIds.slice(0, 5);
    const recentOrders = recentOrderIds.length > 0
      ? await db
          .select()
          .from(orders)
          .where(sql`${orders.id} IN (${recentOrderIds.join(",")})`)
          .orderBy(desc(orders.createdAt))
      : [];

    // Get monthly sales data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyOrderItems = await db
      .select()
      .from(orderItems)
      .where(
        and(
          eq(orderItems.sellerId, sellerId),
          gte(orderItems.createdAt, thirtyDaysAgo)
        )
      );

    // Group by day
    const salesByDay: Record<string, number> = {};
    for (const item of monthlyOrderItems) {
      const date = new Date(item.createdAt).toISOString().split("T")[0];
      salesByDay[date] = (salesByDay[date] || 0) + Number(item.totalPrice);
    }

    const salesChartData = Object.entries(salesByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      seller,
      stats: {
        totalProducts: productsCount.count,
        totalOrders: orderIds.length,
        totalRevenue,
        pendingOrders: recentOrders.filter(o => o.status === "pending").length,
      },
      recentOrders,
      salesChartData,
    };
  }),

  // Create product
  createProduct: authedQuery
    .input(z.object({
      categoryId: z.number(),
      brandId: z.number().optional(),
      name: z.string().min(2),
      slug: z.string(),
      sku: z.string(),
      description: z.string(),
      shortDescription: z.string().optional(),
      price: z.number().positive(),
      compareAtPrice: z.number().optional(),
      quantity: z.number().int().min(0),
      tags: z.string().optional(),
      status: z.enum(["draft", "active", "inactive"]).default("draft"),
      images: z.array(z.object({
        imageUrl: z.string(),
        altText: z.string().optional(),
        isPrimary: z.boolean().default(false),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [seller] = await db
        .select()
        .from(sellers)
        .where(eq(sellers.userId, userId))
        .limit(1);

      if (!seller || seller.status !== "approved") {
        throw new Error("You must be an approved seller to add products");
      }

      const [productResult] = await db.insert(products).values({
        sellerId: seller.id,
        categoryId: input.categoryId,
        brandId: input.brandId,
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        description: input.description,
        shortDescription: input.shortDescription,
        price: input.price.toFixed(2),
        compareAtPrice: input.compareAtPrice?.toFixed(2),
        quantity: input.quantity,
        tags: input.tags,
        status: input.status,
      });

      const productId = Number(productResult.insertId);

      // Insert images
      if (input.images && input.images.length > 0) {
        for (const img of input.images) {
          await db.insert(productImages).values({
            productId,
            imageUrl: img.imageUrl,
            altText: img.altText || input.name,
            isPrimary: img.isPrimary,
          });
        }
      }

      return { success: true, productId };
    }),

  // Get seller products
  myProducts: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const [seller] = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, userId))
      .limit(1);

    if (!seller) return [];

    const sellerProducts = await db
      .select()
      .from(products)
      .where(eq(products.sellerId, seller.id))
      .orderBy(desc(products.createdAt));

    const productIds = sellerProducts.map(p => p.id);
    const images = productIds.length > 0
      ? await db.select().from(productImages).where(sql`${productImages.productId} IN (${productIds.join(",")})`)
      : [];

    return sellerProducts.map(product => ({
      ...product,
      images: images.filter(img => img.productId === product.id),
      primaryImage: images.find(img => img.productId === product.id && img.isPrimary) || images.find(img => img.productId === product.id),
    }));
  }),

  // Update product
  updateProduct: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      quantity: z.number().optional(),
      status: z.enum(["draft", "active", "inactive", "out_of_stock"]).optional(),
      isFeatured: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [seller] = await db
        .select()
        .from(sellers)
        .where(eq(sellers.userId, userId))
        .limit(1);

      if (!seller) throw new Error("Seller not found");

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.price !== undefined) updateData.price = input.price.toFixed(2);
      if (input.quantity !== undefined) updateData.quantity = input.quantity;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;

      await db
        .update(products)
        .set(updateData)
        .where(and(eq(products.id, input.id), eq(products.sellerId, seller.id)));

      return { success: true };
    }),

  // Delete product
  deleteProduct: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [seller] = await db
        .select()
        .from(sellers)
        .where(eq(sellers.userId, userId))
        .limit(1);

      if (!seller) throw new Error("Seller not found");

      await db
        .delete(products)
        .where(and(eq(products.id, input.id), eq(products.sellerId, seller.id)));

      return { success: true };
    }),
});

// Admin seller management
export const adminSellerRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(sellers).orderBy(desc(sellers.createdAt));
  }),

  updateStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected", "suspended"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(sellers)
        .set({ status: input.status })
        .where(eq(sellers.id, input.id));
      return { success: true };
    }),
});

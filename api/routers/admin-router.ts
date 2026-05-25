import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, products, orders, categories, brands, banners, reviews, coupons, notifications, auditLogs, sellers } from "@db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export const adminRouter = createRouter({
  // Dashboard overview stats
  dashboard: adminQuery.query(async () => {
    const db = getDb();

    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [productsCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [ordersCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [sellersCount] = await db.select({ count: sql<number>`count(*)` }).from(sellers);

    // Revenue calculation
    const [revenueResult] = await db
      .select({ total: sql<string>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));

    // Pending sellers
    const [pendingSellers] = await db
      .select({ count: sql<number>`count(*)` })
      .from(sellers)
      .where(eq(sellers.status, "pending"));

    // Pending reviews
    const [pendingReviews] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.status, "pending"));

    // Recent orders
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Sales chart data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sql<string>`coalesce(sum(${orders.total}), 0)`,
        orders: sql<number>`count(*)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // User growth (last 30 days)
    const dailyUsers = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    return {
      stats: {
        totalUsers: usersCount.count,
        totalProducts: productsCount.count,
        totalOrders: ordersCount.count,
        totalSellers: sellersCount.count,
        totalRevenue: Number(revenueResult.total),
        pendingSellers: pendingSellers.count,
        pendingReviews: pendingReviews.count,
      },
      recentOrders,
      salesChartData: dailySales,
      userGrowthData: dailyUsers,
    };
  }),

  // User management
  users: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      role: z.enum(["user", "admin", "seller", "all"]).default("all"),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { page: 1, limit: 20, role: "all" };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];
      if (params.role !== "all") {
        conditions.push(eq(users.role, params.role));
      }
      if (params.search) {
        conditions.push(sql`(${users.name} LIKE ${`%${params.search}%`} OR ${users.email} LIKE ${`%${params.search}%`})`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(params.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(whereClause);

      return {
        items,
        total: totalResult.count,
        page: params.page,
        totalPages: Math.ceil(totalResult.count / params.limit),
      };
    }),

  // Update user role
  updateUserRole: adminQuery
    .input(z.object({
      id: z.number(),
      role: z.enum(["user", "admin", "seller"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      return { success: true };
    }),

  // Product management
  products: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["active", "draft", "inactive", "all"]).default("all"),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { page: 1, limit: 20, status: "all" };
      const offset = (params.page - 1) * params.limit;

      const whereClause = params.status !== "all" ? eq(products.status, params.status) : undefined;

      const items = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(desc(products.createdAt))
        .limit(params.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

      return {
        items,
        total: totalResult.count,
        page: params.page,
        totalPages: Math.ceil(totalResult.count / params.limit),
      };
    }),

  // Update product status
  updateProductStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "draft", "inactive", "out_of_stock"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(products).set({ status: input.status }).where(eq(products.id, input.id));
      return { success: true };
    }),

  // Order management
  orders: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { page: 1, limit: 20 };
      const offset = (params.page - 1) * params.limit;

      const whereClause = params.status ? eq(orders.status, params.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded") : undefined;

      const items = await db
        .select()
        .from(orders)
        .where(whereClause)
        .orderBy(desc(orders.createdAt))
        .limit(params.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(whereClause);

      return {
        items,
        total: totalResult.count,
        page: params.page,
        totalPages: Math.ceil(totalResult.count / params.limit),
      };
    }),

  // Update order status
  updateOrderStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.id));

      // Create notification for user
      const [order] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      if (order) {
        await db.insert(notifications).values({
          userId: order.userId,
          title: "Order Status Updated",
          message: `Your order #${order.orderNumber} is now ${input.status}.`,
          type: "order",
          actionUrl: `/orders`,
        });
      }

      return { success: true };
    }),

  // Review management
  reviews: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["pending", "approved", "rejected", "all"]).default("all"),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { page: 1, limit: 20, status: "all" };
      const offset = (params.page - 1) * params.limit;

      const whereClause = params.status !== "all" ? eq(reviews.status, params.status) : undefined;

      const items = await db
        .select()
        .from(reviews)
        .where(whereClause)
        .orderBy(desc(reviews.createdAt))
        .limit(params.limit)
        .offset(offset);

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(whereClause);

      return {
        items,
        total: totalResult.count,
        page: params.page,
        totalPages: Math.ceil(totalResult.count / params.limit),
      };
    }),

  // Update review status
  updateReviewStatus: adminQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "approved", "rejected"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(reviews).set({ status: input.status }).where(eq(reviews.id, input.id));
      return { success: true };
    }),

  // Banner/CMS management
  banners: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(banners).orderBy(desc(banners.createdAt));
  }),

  createBanner: adminQuery
    .input(z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      imageUrl: z.string(),
      linkUrl: z.string().optional(),
      position: z.enum(["hero", "featured", "promo", "sidebar"]).default("hero"),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(banners).values(input);
      return { success: true, id: Number(result.insertId) };
    }),

  deleteBanner: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(banners).where(eq(banners.id, input.id));
      return { success: true };
    }),

  // Coupon management
  coupons: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }),

  createCoupon: adminQuery
    .input(z.object({
      code: z.string(),
      description: z.string().optional(),
      discountType: z.enum(["percentage", "fixed_amount"]),
      discountValue: z.number().positive(),
      minPurchase: z.number().default(0),
      maxDiscount: z.number().optional(),
      usageLimit: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(coupons).values({
        ...input,
        discountValue: input.discountValue.toFixed(2),
        minPurchase: input.minPurchase.toFixed(2),
        maxDiscount: input.maxDiscount?.toFixed(2),
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      });
      return { success: true, id: Number(result.insertId) };
    }),

  // Audit logs
  auditLogs: adminQuery
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { page: 1, limit: 50 };
      const offset = (params.page - 1) * params.limit;

      const items = await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(params.limit)
        .offset(offset);

      const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(auditLogs);

      return {
        items,
        total: totalResult.count,
        page: params.page,
        totalPages: Math.ceil(totalResult.count / params.limit),
      };
    }),

  // Create notification
  createNotification: adminQuery
    .input(z.object({
      userId: z.number(),
      title: z.string(),
      message: z.string(),
      type: z.enum(["order", "promotion", "system", "seller"]).default("system"),
      actionUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(notifications).values(input);
      return { success: true };
    }),
});

// Category admin
export const adminCategoryRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories).orderBy(desc(categories.createdAt));
  }),

  create: adminQuery
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      image: z.string().optional(),
      parentId: z.number().optional(),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(categories).values(input);
      return { success: true, id: Number(result.insertId) };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});

// Brand admin
export const adminBrandRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(brands).orderBy(desc(brands.createdAt));
  }),

  create: adminQuery
    .input(z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      logo: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(brands).values(input);
      return { success: true, id: Number(result.insertId) };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(brands).where(eq(brands.id, input.id));
      return { success: true };
    }),
});

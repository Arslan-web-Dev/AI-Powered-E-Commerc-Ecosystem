import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products, categories, brands, productImages, reviews, recentlyViewed } from "@db/schema";
import { eq, and, like, desc, asc, sql, gte, lte, inArray } from "drizzle-orm";

export const productRouter = createRouter({
  // Get all products with filters, search, sort, pagination
  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        categoryId: z.number().optional(),
        brandId: z.number().optional(),
        sellerId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sortBy: z.enum(["price_asc", "price_desc", "name_asc", "name_desc", "rating", "newest", "bestselling"]).default("newest"),
        status: z.enum(["active", "draft", "inactive", "all"]).default("active"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input ?? { page: 1, limit: 20, sortBy: "newest", status: "active" };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];

      if (params.status !== "all") {
        conditions.push(eq(products.status, params.status));
      }
      if (params.categoryId) {
        conditions.push(eq(products.categoryId, params.categoryId));
      }
      if (params.brandId) {
        conditions.push(eq(products.brandId, params.brandId));
      }
      if (params.sellerId) {
        conditions.push(eq(products.sellerId, params.sellerId));
      }
      if (params.search) {
        conditions.push(like(products.name, `%${params.search}%`));
      }
      if (params.minPrice !== undefined) {
        conditions.push(gte(products.price, params.minPrice.toString()));
      }
      if (params.maxPrice !== undefined) {
        conditions.push(lte(products.price, params.maxPrice.toString()));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Build order by
      let orderBy;
      switch (params.sortBy) {
        case "price_asc": orderBy = asc(products.price); break;
        case "price_desc": orderBy = desc(products.price); break;
        case "name_asc": orderBy = asc(products.name); break;
        case "name_desc": orderBy = desc(products.name); break;
        case "rating": orderBy = desc(products.rating); break;
        case "bestselling": orderBy = desc(products.soldCount); break;
        case "newest": default: orderBy = desc(products.createdAt); break;
      }

      const items = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(params.limit)
        .offset(offset);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause);

      const total = countResult[0]?.count ?? 0;

      // Get images for products
      const productIds = items.map(p => p.id);
      const images = productIds.length > 0
        ? await db.select().from(productImages).where(inArray(productImages.productId, productIds))
        : [];

      const itemsWithImages = items.map(product => ({
        ...product,
        images: images.filter(img => img.productId === product.id),
        primaryImage: images.find(img => img.productId === product.id && img.isPrimary) || images.find(img => img.productId === product.id),
      }));

      return {
        items: itemsWithImages,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  // Get single product by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [product] = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
      if (!product) return null;

      const images = await db.select().from(productImages).where(eq(productImages.productId, product.id));
      const productReviews = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, product.id), eq(reviews.status, "approved")))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      // Get related products
      const related = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.categoryId, product.categoryId),
            sql`${products.id} != ${product.id}`,
            eq(products.status, "active")
          )
        )
        .limit(4);

      const relatedIds = related.map(p => p.id);
      const relatedImages = relatedIds.length > 0
        ? await db.select().from(productImages).where(inArray(productImages.productId, relatedIds))
        : [];

      return {
        ...product,
        images,
        reviews: productReviews,
        relatedProducts: related.map(p => ({
          ...p,
          primaryImage: relatedImages.find(img => img.productId === p.id),
        })),
      };
    }),

  // Get featured products
  featured: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.status, "active")))
      .orderBy(desc(products.createdAt))
      .limit(8);

    const productIds = items.map(p => p.id);
    const images = productIds.length > 0
      ? await db.select().from(productImages).where(inArray(productImages.productId, productIds))
      : [];

    return items.map(product => ({
      ...product,
      primaryImage: images.find(img => img.productId === product.id),
    }));
  }),

  // Get trending products
  trending: publicQuery.query(async () => {
    const db = getDb();
    const items = await db
      .select()
      .from(products)
      .where(and(eq(products.isTrending, true), eq(products.status, "active")))
      .orderBy(desc(products.soldCount))
      .limit(8);

    const productIds = items.map(p => p.id);
    const images = productIds.length > 0
      ? await db.select().from(productImages).where(inArray(productImages.productId, productIds))
      : [];

    return items.map(product => ({
      ...product,
      primaryImage: images.find(img => img.productId === product.id),
    }));
  }),

  // Record product view
  recordView: publicQuery
    .input(z.object({ productId: z.number(), userId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(products)
        .set({ viewCount: sql`${products.viewCount} + 1` })
        .where(eq(products.id, input.productId));

      if (input.userId) {
        await db.insert(recentlyViewed).values({
          userId: input.userId,
          productId: input.productId,
        });
      }
      return { success: true };
    }),
});

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [category] = await db.select().from(categories).where(eq(categories.slug, input.slug)).limit(1);
      return category ?? null;
    }),
});

export const brandRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.name));
  }),
});

export const reviewRouter = createRouter({
  create: authedQuery
    .input(z.object({
      productId: z.number(),
      orderId: z.number().optional(),
      rating: z.number().min(1).max(5),
      title: z.string().optional(),
      content: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [review] = await db.insert(reviews).values({
        productId: input.productId,
        userId,
        orderId: input.orderId,
        rating: input.rating,
        title: input.title,
        content: input.content,
        status: "pending",
      });

      return { success: true, reviewId: Number(review.insertId) };
    }),

  getByProduct: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.status, "approved")))
        .orderBy(desc(reviews.createdAt));
    }),
});

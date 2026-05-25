import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notifications, wishlists, products, productImages, users } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const notificationRouter = createRouter({
  // Get user notifications
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const unreadCount = items.filter(n => !n.isRead).length;

    return { items, unreadCount };
  }),

  // Mark as read
  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      return { success: true };
    }),

  // Mark all as read
  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, ctx.user.id));
    return { success: true };
  }),
});

export const wishlistRouter = createRouter({
  // Get user's wishlist
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const items = await db
      .select({
        wishlist: wishlists,
        product: products,
      })
      .from(wishlists)
      .leftJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));

    const productIds = items.map(i => i.product?.id).filter(Boolean) as number[];
    const images = productIds.length > 0
      ? await db.select().from(productImages).where(sql`${productImages.productId} IN (${productIds.join(",")})`)
      : [];

    return items.map(({ wishlist, product }) => ({
      ...wishlist,
      product: product ? {
        ...product,
        primaryImage: images.find(img => img.productId === product.id && img.isPrimary) || images.find(img => img.productId === product.id),
      } : null,
    }));
  }),

  // Toggle wishlist item
  toggle: authedQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [existing] = await db
        .select()
        .from(wishlists)
        .where(and(eq(wishlists.userId, userId), eq(wishlists.productId, input.productId)))
        .limit(1);

      if (existing) {
        await db.delete(wishlists).where(eq(wishlists.id, existing.id));
        return { added: false };
      } else {
        await db.insert(wishlists).values({ userId, productId: input.productId });
        return { added: true };
      }
    }),

  // Check if product is in wishlist
  check: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(wishlists)
        .where(and(eq(wishlists.userId, ctx.user.id), eq(wishlists.productId, input.productId)))
        .limit(1);

      return { inWishlist: !!existing };
    }),
});

export const profileRouter = createRouter({
  // Get profile
  me: authedQuery.query(async ({ ctx }) => {
    return ctx.user;
  }),

  // Update profile
  update: authedQuery
    .input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      await db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return { success: true };
    }),
});

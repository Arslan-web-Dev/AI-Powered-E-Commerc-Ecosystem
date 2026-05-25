import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { cartItems, products, productImages, coupons } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const cartRouter = createRouter({
  // Get user's cart
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const items = await db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    // Get images for products
    const productIds = items.map(i => i.product?.id).filter(Boolean) as number[];
    const images = productIds.length > 0
      ? await db.select().from(productImages).where(sql`${productImages.productId} IN (${productIds.join(",")})`)
      : [];

    let subtotal = 0;
    const cartItemsWithDetails = items.map(({ cartItem, product }) => {
      if (!product) return null;
      const itemTotal = Number(product.price) * cartItem.quantity;
      subtotal += itemTotal;
      return {
        ...cartItem,
        product,
        primaryImage: images.find(img => img.productId === product.id && img.isPrimary) || images.find(img => img.productId === product.id),
        itemTotal,
      };
    }).filter(Boolean);

    return {
      items: cartItemsWithDetails,
      subtotal,
      itemCount: cartItemsWithDetails.length,
    };
  }),

  // Add item to cart
  add: authedQuery
    .input(z.object({
      productId: z.number(),
      variantId: z.number().optional(),
      quantity: z.number().min(1).default(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Check if item already in cart
      const [existing] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, input.productId),
            input.variantId ? eq(cartItems.variantId, input.variantId) : sql`1=1`
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(cartItems)
          .set({ quantity: existing.quantity + input.quantity })
          .where(eq(cartItems.id, existing.id));
      } else {
        await db.insert(cartItems).values({
          userId,
          productId: input.productId,
          variantId: input.variantId,
          quantity: input.quantity,
        });
      }

      return { success: true };
    }),

  // Update cart item quantity
  update: authedQuery
    .input(z.object({
      cartItemId: z.number(),
      quantity: z.number().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      if (input.quantity === 0) {
        await db
          .delete(cartItems)
          .where(and(eq(cartItems.id, input.cartItemId), eq(cartItems.userId, userId)));
      } else {
        await db
          .update(cartItems)
          .set({ quantity: input.quantity })
          .where(and(eq(cartItems.id, input.cartItemId), eq(cartItems.userId, userId)));
      }

      return { success: true };
    }),

  // Remove item from cart
  remove: authedQuery
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, input.cartItemId), eq(cartItems.userId, userId)));

      return { success: true };
    }),

  // Clear cart
  clear: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return { success: true };
  }),

  // Validate coupon
  validateCoupon: authedQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, input.code.toUpperCase()),
            eq(coupons.isActive, true)
          )
        )
        .limit(1);

      if (!coupon) return { valid: false, message: "Invalid coupon code" };

      const now = new Date();
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        return { valid: false, message: "Coupon not yet active" };
      }
      if (coupon.endDate && new Date(coupon.endDate) < now) {
        return { valid: false, message: "Coupon expired" };
      }
      if (coupon.usageLimit && (coupon.usageCount ?? 0) >= coupon.usageLimit) {
        return { valid: false, message: "Coupon usage limit reached" };
      }

      return {
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          minPurchase: Number(coupon.minPurchase),
          maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
        },
      };
    }),
});

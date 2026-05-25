import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems, cartItems, products, productImages, coupons, notifications } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function generateOrderNumber() {
  return "ORD-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export const orderRouter = createRouter({
  // Create order from cart
  create: authedQuery
    .input(z.object({
      shippingAddress: z.string(),
      shippingCity: z.string(),
      shippingCountry: z.string(),
      shippingPostalCode: z.string(),
      paymentMethod: z.enum(["credit_card", "paypal", "stripe"]),
      couponCode: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      // Get cart items
      const cart = await db
        .select({
          cartItem: cartItems,
          product: products,
        })
        .from(cartItems)
        .leftJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, userId));

      if (cart.length === 0) {
        throw new Error("Cart is empty");
      }

      let subtotal = 0;
      const orderItemsData = [];
      const productIds = [];

      for (const { cartItem, product } of cart) {
        if (!product) continue;
        const itemTotal = Number(product.price) * cartItem.quantity;
        subtotal += itemTotal;
        productIds.push(product.id);

        // Get primary image
        const [img] = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .limit(1);

        orderItemsData.push({
          productId: product.id,
          sellerId: product.sellerId,
          variantName: cartItem.variantId ? "Variant" : undefined,
          productName: product.name,
          productImage: img?.imageUrl,
          quantity: cartItem.quantity,
          unitPrice: product.price,
          totalPrice: itemTotal.toFixed(2),
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (input.couponCode) {
        const [coupon] = await db
          .select()
          .from(coupons)
          .where(and(eq(coupons.code, input.couponCode), eq(coupons.isActive, true)))
          .limit(1);

        if (coupon) {
          if (coupon.discountType === "percentage") {
            discountAmount = subtotal * (Number(coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
              discountAmount = Number(coupon.maxDiscount);
            }
          } else {
            discountAmount = Number(coupon.discountValue);
          }
          // Increment usage
          await db
            .update(coupons)
            .set({ usageCount: sql`${coupons.usageCount} + 1` })
            .where(eq(coupons.id, coupon.id));
        }
      }

      const taxAmount = subtotal * 0.08; // 8% tax
      const shippingAmount = subtotal > 100 ? 0 : 9.99;
      const total = subtotal + taxAmount + shippingAmount - discountAmount;

      // Create order
      const [orderResult] = await db.insert(orders).values({
        userId,
        orderNumber: generateOrderNumber(),
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: input.paymentMethod,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        total: total.toFixed(2),
        couponCode: input.couponCode,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingCountry: input.shippingCountry,
        shippingPostalCode: input.shippingPostalCode,
        notes: input.notes,
      });

      const orderId = Number(orderResult.insertId);

      // Create order items
      for (const item of orderItemsData) {
        await db.insert(orderItems).values({
          orderId,
          ...item,
        });
      }

      // Update product sold counts
      for (const { cartItem, product } of cart) {
        if (product) {
          await db
            .update(products)
            .set({
              soldCount: sql`${products.soldCount} + ${cartItem.quantity}`,
              quantity: sql`${products.quantity} - ${cartItem.quantity}`,
            })
            .where(eq(products.id, product.id));
        }
      }

      // Clear cart
      await db.delete(cartItems).where(eq(cartItems.userId, userId));

      // Create notification
      await db.insert(notifications).values({
        userId,
        title: "Order Placed Successfully",
        message: `Your order #${orderId} has been placed and is being processed.`,
        type: "order",
        actionUrl: `/orders`,
      });

      return { success: true, orderId, orderNumber: generateOrderNumber() };
    }),

  // Get user's orders
  myOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    // Get order items for each order
    const orderIds = userOrders.map(o => o.id);
    const items = orderIds.length > 0
      ? await db.select().from(orderItems).where(sql`${orderItems.orderId} IN (${orderIds.join(",")})`)
      : [];

    return userOrders.map(order => ({
      ...order,
      items: items.filter(item => item.orderId === order.id),
    }));
  }),

  // Get single order
  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.id), eq(orders.userId, userId)))
        .limit(1);

      if (!order) return null;

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),

  // Cancel order
  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;

      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(and(eq(orders.id, input.id), eq(orders.userId, userId)));

      return { success: true };
    }),
});

import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { productRouter, categoryRouter, brandRouter, reviewRouter } from "./routers/product-router";
import { cartRouter } from "./routers/cart-router";
import { orderRouter } from "./routers/order-router";
import { sellerRouter, adminSellerRouter } from "./routers/seller-router";
import { adminRouter, adminCategoryRouter, adminBrandRouter } from "./routers/admin-router";
import { aiRouter } from "./routers/ai-router";
import { notificationRouter, wishlistRouter, profileRouter } from "./routers/user-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,

  // Product & catalog
  product: productRouter,
  category: categoryRouter,
  brand: brandRouter,
  review: reviewRouter,

  // Cart & checkout
  cart: cartRouter,

  // Orders
  order: orderRouter,

  // Seller
  seller: sellerRouter,
  adminSeller: adminSellerRouter,

  // Admin
  admin: adminRouter,
  adminCategory: adminCategoryRouter,
  adminBrand: adminBrandRouter,

  // AI
  ai: aiRouter,

  // User features
  notification: notificationRouter,
  wishlist: wishlistRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;

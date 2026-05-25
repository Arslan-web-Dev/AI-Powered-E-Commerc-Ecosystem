import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { products, aiConversations, reviews, recentlyViewed } from "@db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

// AI-powered product recommendations
export const aiRouter = createRouter({
  // Get personalized recommendations for user
  recommendations: publicQuery
    .input(z.object({ userId: z.number().optional(), limit: z.number().default(8) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit ?? 8;

      let recommendedProducts;

      if (input?.userId) {
        // Get user's recently viewed categories
        const viewed = await db
          .select()
          .from(recentlyViewed)
          .where(eq(recentlyViewed.userId, input.userId))
          .orderBy(desc(recentlyViewed.viewedAt))
          .limit(10);

        const viewedProductIds = viewed.map(v => v.productId);

        if (viewedProductIds.length > 0) {
          // Get categories of viewed products
          const viewedProducts = await db
            .select()
            .from(products)
            .where(inArray(products.id, viewedProductIds));

          const categoryIds = [...new Set(viewedProducts.map(p => p.categoryId))];

          // Get similar products from same categories
          recommendedProducts = await db
            .select()
            .from(products)
            .where(
              and(
                inArray(products.categoryId, categoryIds),
                sql`${products.id} NOT IN (${viewedProductIds.join(",")})`,
                eq(products.status, "active")
              )
            )
            .orderBy(desc(products.rating), desc(products.soldCount))
            .limit(limit);
        }
      }

      // Fallback to trending products
      if (!recommendedProducts || recommendedProducts.length === 0) {
        recommendedProducts = await db
          .select()
          .from(products)
          .where(eq(products.status, "active"))
          .orderBy(desc(products.soldCount), desc(products.rating))
          .limit(limit);
      }

      return recommendedProducts.map(p => ({
        ...p,
        reason: input?.userId ? "Based on your browsing history" : "Trending now",
      }));
    }),

  // AI Chatbot
  chat: publicQuery
    .input(z.object({
      message: z.string(),
      sessionId: z.string(),
      userId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Save user message
      await db.insert(aiConversations).values({
        sessionId: input.sessionId,
        userId: input.userId,
        role: "user",
        message: input.message,
      });

      // Simple intent detection
      const msg = input.message.toLowerCase();
      let response: string;
      let intent: string;

      if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("best")) {
        intent = "recommendation";
        const dbProducts = await db
          .select()
          .from(products)
          .where(eq(products.status, "active"))
          .orderBy(desc(products.rating))
          .limit(3);

        const productNames = dbProducts.map(p => p.name).join(", ");
        response = `Based on our top-rated items, I'd recommend checking out: ${productNames}. These are our best-sellers with excellent customer reviews. Would you like more details about any of these?`;
      } else if (msg.includes("price") || msg.includes("cost") || msg.includes("cheap") || msg.includes("discount")) {
        intent = "pricing";
        response = "We have products across various price ranges! You can use our price filters to find items within your budget. Plus, check out our 'Deals' section for current discounts and promotions. Would you like me to help you find something specific?";
      } else if (msg.includes("order") || msg.includes("track") || msg.includes("shipping")) {
        intent = "order_support";
        response = "You can track your orders in your account dashboard under 'My Orders'. If you need help with a specific order, please provide your order number and I'll assist you right away!";
      } else if (msg.includes("return") || msg.includes("refund")) {
        intent = "returns";
        response = "Our return policy is simple: you can return most items within 30 days of delivery for a full refund. To start a return, go to your order history and select 'Return Item'. Is there a specific order you'd like to return?";
      } else if (msg.includes("payment") || msg.includes("pay") || msg.includes("card")) {
        intent = "payment";
        response = "We accept all major credit cards, PayPal, and Stripe for secure payments. All transactions are encrypted with SSL technology. Is there a specific payment issue I can help with?";
      } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        intent = "greeting";
        response = "Hello! Welcome to NexusAI Commerce! I'm your AI shopping assistant. I can help you find products, check order status, provide recommendations, and answer any questions. What can I help you with today?";
      } else if (msg.includes("thank")) {
        intent = "gratitude";
        response = "You're welcome! I'm happy to help. If you need anything else, feel free to ask. Happy shopping!";
      } else {
        intent = "general";
        response = `Thanks for your message! I'm here to help with product recommendations, order tracking, returns, and general shopping assistance. Could you tell me more about what you're looking for? Or try asking about our trending products, deals, or specific categories.`;
      }

      // Save AI response
      await db.insert(aiConversations).values({
        sessionId: input.sessionId,
        userId: input.userId,
        role: "assistant",
        message: response,
        intent,
      });

      return { response, intent };
    }),

  // Get chat history
  chatHistory: publicQuery
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.sessionId, input.sessionId))
        .orderBy(aiConversations.createdAt);
    }),

  // AI Review Summary
  reviewSummary: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const productReviews = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.status, "approved")))
        .orderBy(desc(reviews.createdAt))
        .limit(50);

      if (productReviews.length === 0) {
        return { summary: "No reviews yet. Be the first to review this product!", sentiment: "neutral" as const, rating: 0 };
      }

      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      const positiveCount = productReviews.filter(r => r.rating >= 4).length;
      const negativeCount = productReviews.filter(r => r.rating <= 2).length;
      const sentiment = positiveCount > negativeCount ? "positive" : negativeCount > positiveCount ? "negative" : "neutral";

      let summary: string;
      if (avgRating >= 4.5) {
        summary = `Customers love this product! With an average rating of ${avgRating.toFixed(1)}/5 from ${productReviews.length} reviews, buyers consistently praise its quality and value. ${positiveCount} out of ${productReviews.length} reviewers gave it 4+ stars. Highly recommended!`;
      } else if (avgRating >= 3.5) {
        summary = `This product has solid reviews with a ${avgRating.toFixed(1)}/5 average from ${productReviews.length} customers. Most buyers are satisfied with their purchase. A few users noted areas for improvement, but overall it's a reliable choice.`;
      } else {
        summary = `This product has mixed reviews with a ${avgRating.toFixed(1)}/5 average from ${productReviews.length} customers. While some buyers found it satisfactory, others experienced issues. We recommend reading individual reviews to see if it meets your specific needs.`;
      }

      return { summary, sentiment, rating: avgRating, totalReviews: productReviews.length };
    }),

  // AI SEO Generator (simulated)
  generateSeo: publicQuery
    .input(z.object({
      productName: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { productName, description, category } = input;

      // Generate SEO-optimized metadata
      const seoTitle = `${productName} | Buy ${category || "Online"} at NexusAI Commerce - Best Prices`;
      const seoDescription = description
        ? `${description.slice(0, 120)}... Shop ${productName} now at NexusAI Commerce. Free shipping on orders over $100. Best price guaranteed!`
        : `Shop ${productName} at NexusAI Commerce. Discover premium quality at unbeatable prices. Free shipping, easy returns, and 24/7 customer support.`;
      const keywords = [
        productName.toLowerCase(),
        (category || "product").toLowerCase(),
        "buy online",
        "best price",
        "free shipping",
        "premium quality",
        "nexusai commerce",
      ].join(", ");

      return { seoTitle, seoDescription, keywords };
    }),

  // AI Product Description Generator
  generateDescription: publicQuery
    .input(z.object({
      productName: z.string(),
      features: z.array(z.string()).optional(),
      tone: z.enum(["professional", "casual", "luxury", "technical"]).default("professional"),
    }))
    .mutation(async ({ input }) => {
      const { productName, features, tone } = input;

      const featureList = features?.length
        ? features.map(f => `- ${f}`).join("\n")
        : "- Premium quality\n- Expertly crafted\n- Long-lasting durability";

      let description: string;
      switch (tone) {
        case "luxury":
          description = `Indulge in the exquisite craftsmanship of the ${productName}. Meticulously designed for the discerning connoisseur, this premium offering represents the pinnacle of quality and sophistication. Each detail has been carefully considered to deliver an unparalleled experience that transcends the ordinary.

**Key Features:**
${featureList}

Elevate your lifestyle with this exceptional piece — where luxury meets functionality in perfect harmony.`;
          break;
        case "technical":
          description = `The ${productName} is engineered with precision and built to perform. Designed using advanced manufacturing techniques and premium materials, this product delivers consistent, reliable results.

**Specifications:**
${featureList}

**Technical Excellence:**
Manufactured to the highest industry standards, the ${productName} undergoes rigorous quality testing to ensure optimal performance and longevity. Ideal for both professional and personal use.`;
          break;
        case "casual":
          description = `Meet your new favorite ${productName}! We've designed this to fit seamlessly into your everyday life. It's simple, reliable, and just works — no fuss, no hassle.

**What makes it great:**
${featureList}

Grab yours today and see why everyone's loving it!`;
          break;
        default:
          description = `Discover the exceptional quality of the ${productName}. Thoughtfully designed and carefully crafted, this product combines style, functionality, and durability to meet your highest expectations.

**Highlights:**
${featureList}

Whether you're upgrading your current setup or searching for the perfect solution, the ${productName} delivers outstanding value and performance you can count on.`;
      }

      return { description };
    }),

  // AI Sales Prediction (simulated)
  salesPrediction: authedQuery
    .input(z.object({ productId: z.number() }).optional())
    .query(async () => {
      // Generate realistic sales prediction data
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();

      const predictions = months.map((month, i) => {
        const isFuture = i > currentMonth;
        const baseValue = 1000 + Math.random() * 4000;
        const seasonalFactor = 1 + 0.3 * Math.sin((i / 12) * 2 * Math.PI);
        const growthFactor = 1 + (i * 0.05);
        const predicted = Math.round(baseValue * seasonalFactor * growthFactor);
        const confidence = isFuture ? 85 + Math.random() * 10 : 100;

        return {
          month,
          actual: isFuture ? null : Math.round(predicted * (0.9 + Math.random() * 0.2)),
          predicted,
          confidence: Math.round(confidence),
          isProjected: isFuture,
        };
      });

      const totalPredicted = predictions.reduce((sum, p) => sum + p.predicted, 0);
      const avgGrowth = 12.5 + Math.random() * 8;

      return {
        predictions,
        summary: `Based on historical data and market trends, we predict a ${avgGrowth.toFixed(1)}% growth trajectory over the next 12 months. Total projected revenue: $${totalPredicted.toLocaleString()}.`,
        growthRate: avgGrowth.toFixed(1),
        confidence: 88,
      };
    }),

  // AI Inventory Prediction
  inventoryPrediction: authedQuery.query(async () => {
    const db = getDb();
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, "active"))
      .limit(50);

    const predictions = allProducts.map(product => {
      const currentStock = product.quantity;
      const soldCount = product.soldCount ?? 0;
      const daysToDeplete = soldCount > 0
        ? Math.round((currentStock / (soldCount / 30)))
        : 999;

      let status: "optimal" | "low" | "critical" | "overstock";
      if (currentStock === 0) status = "critical";
      else if (daysToDeplete < 7) status = "critical";
      else if (daysToDeplete < 30) status = "low";
      else if (currentStock > 500) status = "overstock";
      else status = "optimal";

      const recommendedOrder = status === "critical" ? Math.max(50, soldCount * 2) : status === "low" ? Math.max(30, soldCount) : 0;

      return {
        productId: product.id,
        productName: product.name,
        currentStock,
        soldLast30Days: soldCount,
        daysUntilStockout: daysToDeplete,
        status,
        recommendedOrder: recommendedOrder > 0 ? Math.round(recommendedOrder) : 0,
      };
    });

    return {
      predictions,
      summary: `${predictions.filter(p => p.status === "critical").length} products need immediate restocking. ${predictions.filter(p => p.status === "low").length} products running low.`,
      critical: predictions.filter(p => p.status === "critical").length,
      low: predictions.filter(p => p.status === "low").length,
      optimal: predictions.filter(p => p.status === "optimal").length,
      overstock: predictions.filter(p => p.status === "overstock").length,
    };
  }),
});

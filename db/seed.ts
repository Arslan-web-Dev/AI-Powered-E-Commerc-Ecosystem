import { getDb } from "../api/queries/connection";
import {
  categories, brands, products, productImages, banners, coupons,
  reviews,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed categories
  const categoryData = [
    { name: "Electronics", slug: "electronics", description: "Latest gadgets and electronic devices", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=400", level: 0, sortOrder: 1 },
    { name: "Fashion", slug: "fashion", description: "Trendy clothing and accessories", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400", level: 0, sortOrder: 2 },
    { name: "Home & Living", slug: "home-living", description: "Furniture and home decor", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400", level: 0, sortOrder: 3 },
    { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Sports equipment and outdoor gear", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400", level: 0, sortOrder: 4 },
    { name: "Beauty & Health", slug: "beauty-health", description: "Beauty products and health essentials", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400", level: 0, sortOrder: 5 },
    { name: "Books & Media", slug: "books-media", description: "Books, movies, and music", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", level: 0, sortOrder: 6 },
    { name: "Toys & Games", slug: "toys-games", description: "Fun for all ages", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400", level: 0, sortOrder: 7 },
    { name: "Automotive", slug: "automotive", description: "Car accessories and parts", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400", level: 0, sortOrder: 8 },
  ];

  for (const cat of categoryData) {
    try {
      await db.insert(categories).values(cat);
    } catch {
      // May already exist
    }
  }
  console.log("Categories seeded");

  // Seed brands
  const brandData = [
    { name: "TechPro", slug: "techpro", description: "Premium electronics brand", logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200" },
    { name: "StyleHub", slug: "stylehub", description: "Modern fashion brand", logo: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200" },
    { name: "HomeComfort", slug: "homecomfort", description: "Quality home furnishings", logo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=200" },
    { name: "FitLife", slug: "fitlife", description: "Fitness and sports equipment", logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200" },
    { name: "PureGlow", slug: "pureglow", description: "Natural beauty products", logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200" },
    { name: "ReadWell", slug: "readwell", description: "Quality publications", logo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200" },
    { name: "PlayMax", slug: "playmax", description: "Entertainment and games", logo: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=200" },
    { name: "AutoTech", slug: "autotech", description: "Automotive innovation", logo: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200" },
  ];

  for (const brand of brandData) {
    try {
      await db.insert(brands).values(brand);
    } catch {
      // May already exist
    }
  }
  console.log("Brands seeded");

  // Seed products
  const productData = [
    { name: "Wireless Noise-Cancelling Headphones Pro", slug: "wireless-headphones-pro", sku: "WHP-001", description: "Premium over-ear headphones with active noise cancellation, 40-hour battery life, and studio-quality sound. Perfect for music lovers and professionals.", shortDescription: "Premium ANC headphones with 40h battery", price: "299.99", compareAtPrice: "399.99", quantity: 150, tags: "headphones,wireless,noise-cancelling,audio", status: "active" as const, isFeatured: true, isTrending: true, rating: "4.8", reviewCount: 324, seoTitle: "Wireless Noise-Cancelling Headphones Pro | Premium Audio", seoKeywords: "headphones, wireless, noise cancelling, premium audio", categoryId: 1, brandId: 1 },
    { name: "Smart Watch Ultra Series 5", slug: "smart-watch-ultra-5", sku: "SWU-005", description: "Advanced fitness tracking, GPS, heart rate monitoring, and 7-day battery life. Water-resistant to 50 meters with a stunning AMOLED display.", shortDescription: "Advanced fitness smartwatch with 7-day battery", price: "449.99", compareAtPrice: "549.99", quantity: 200, tags: "smartwatch,fitness,wearable,gps", status: "active" as const, isFeatured: true, isTrending: true, rating: "4.7", reviewCount: 512, seoTitle: "Smart Watch Ultra Series 5 | Advanced Fitness Tracker", seoKeywords: "smartwatch, fitness tracker, GPS, wearable", categoryId: 1, brandId: 1 },
    { name: "Ultra-Slim Laptop 15.6\" Pro", slug: "ultra-slim-laptop-pro", sku: "ULP-156", description: "Powerful Intel Core i7 processor, 16GB RAM, 1TB SSD, and a stunning 4K display. Weighs only 1.2kg with 12-hour battery life.", shortDescription: "Ultra-slim laptop with 4K display and 12h battery", price: "1299.99", compareAtPrice: "1599.99", quantity: 75, tags: "laptop,computer,ultrabook,4k", status: "active" as const, isFeatured: true, isTrending: false, rating: "4.6", reviewCount: 189, seoTitle: "Ultra-Slim Laptop 15.6 Pro | Premium Computing", seoKeywords: "laptop, ultrabook, 4K display, Intel i7", categoryId: 1, brandId: 1 },
    { name: "Premium Bluetooth Speaker 360", slug: "bluetooth-speaker-360", sku: "BTS-360", description: "360-degree immersive sound with deep bass, IPX7 waterproof, and 24-hour playtime. Portable design perfect for any adventure.", shortDescription: "360 immersive sound, waterproof, 24h playtime", price: "149.99", compareAtPrice: "199.99", quantity: 300, tags: "speaker,bluetooth,portable,waterproof", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.5", reviewCount: 278, seoTitle: "Premium Bluetooth Speaker 360 | Immersive Audio", seoKeywords: "bluetooth speaker, portable, waterproof, 360 audio", categoryId: 1, brandId: 1 },
    { name: "Designer Leather Crossbody Bag", slug: "designer-leather-crossbody", sku: "DLC-001", description: "Handcrafted from genuine Italian leather with gold-tone hardware. Multiple compartments and adjustable strap for versatile styling.", shortDescription: "Handcrafted Italian leather crossbody bag", price: "189.99", compareAtPrice: "249.99", quantity: 80, tags: "bag,leather,crossbody,designer,fashion", status: "active" as const, isFeatured: true, isTrending: false, rating: "4.9", reviewCount: 156, seoTitle: "Designer Leather Crossbody Bag | Italian Craftsmanship", seoKeywords: "leather bag, crossbody, designer, Italian leather", categoryId: 2, brandId: 2 },
    { name: "Premium Cotton Relaxed Fit T-Shirt", slug: "premium-cotton-tshirt", sku: "PCT-001", description: "100% organic cotton, pre-shrunk, ultra-soft fabric. Available in 12 colors. Perfect everyday essential with a modern fit.", shortDescription: "100% organic cotton ultra-soft t-shirt", price: "39.99", compareAtPrice: "54.99", quantity: 500, tags: "tshirt,cotton,organic,basics", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.4", reviewCount: 892, seoTitle: "Premium Cotton T-Shirt | Organic & Ultra-Soft", seoKeywords: "t-shirt, organic cotton, basics, soft", categoryId: 2, brandId: 2 },
    { name: "Running Performance Sneakers Elite", slug: "running-sneakers-elite", sku: "RSE-001", description: "Carbon fiber plate, responsive foam cushioning, and breathable knit upper. Designed for marathon runners and serious athletes.", shortDescription: "Carbon fiber running shoes with responsive cushioning", price: "229.99", compareAtPrice: "289.99", quantity: 120, tags: "sneakers,running,performance,athletic", status: "active" as const, isFeatured: true, isTrending: true, rating: "4.7", reviewCount: 445, seoTitle: "Running Performance Sneakers Elite | Marathon Ready", seoKeywords: "running shoes, performance sneakers, carbon fiber", categoryId: 2, brandId: 2 },
    { name: "Modern Velvet Accent Chair", slug: "modern-velvet-accent-chair", sku: "MVAC-001", description: "Luxurious velvet upholstery with gold metal legs. Ergonomic design perfect for living rooms, bedrooms, or offices.", shortDescription: "Luxurious velvet accent chair with gold legs", price: "349.99", compareAtPrice: "449.99", quantity: 45, tags: "chair,furniture,velvet,accent,modern", status: "active" as const, isFeatured: true, isTrending: false, rating: "4.6", reviewCount: 98, seoTitle: "Modern Velvet Accent Chair | Luxurious Seating", seoKeywords: "accent chair, velvet furniture, modern chair", categoryId: 3, brandId: 3 },
    { name: "Smart LED Floor Lamp", slug: "smart-led-floor-lamp", sku: "SLFL-001", description: "App-controlled RGB floor lamp with 16 million colors, voice assistant compatibility, and adjustable brightness levels.", shortDescription: "App-controlled RGB smart floor lamp", price: "129.99", compareAtPrice: "179.99", quantity: 200, tags: "lamp,lighting,smart,LED,RGB", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.5", reviewCount: 234, seoTitle: "Smart LED Floor Lamp | 16 Million Colors", seoKeywords: "smart lamp, LED, RGB, app controlled", categoryId: 3, brandId: 3 },
    { name: "Yoga Mat Premium Non-Slip", slug: "yoga-mat-premium", sku: "YMP-001", description: "Extra-thick 8mm eco-friendly TPE material with alignment lines. Non-slip surface perfect for hot yoga and intense workouts.", shortDescription: "Extra-thick eco-friendly non-slip yoga mat", price: "59.99", compareAtPrice: "79.99", quantity: 350, tags: "yoga,mat,fitness,non-slip,eco-friendly", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.8", reviewCount: 567, seoTitle: "Premium Non-Slip Yoga Mat | Eco-Friendly", seoKeywords: "yoga mat, non-slip, eco-friendly, fitness", categoryId: 4, brandId: 4 },
    { name: "Adjustable Dumbbells Set 5-50lbs", slug: "adjustable-dumbbells-set", sku: "ADS-501", description: "Space-saving adjustable dumbbells replacing 15 sets. Quick-change weight system with secure locking mechanism.", shortDescription: "Space-saving adjustable dumbbells 5-50lbs", price: "399.99", compareAtPrice: "499.99", quantity: 60, tags: "dumbbells,weights,adjustable,home-gym", status: "active" as const, isFeatured: true, isTrending: false, rating: "4.7", reviewCount: 312, seoTitle: "Adjustable Dumbbells 5-50lbs | Space-Saving", seoKeywords: "adjustable dumbbells, home gym, weights", categoryId: 4, brandId: 4 },
    { name: "Organic Skincare Gift Set", slug: "organic-skincare-gift-set", sku: "OSGS-001", description: "Complete skincare routine with cleanser, toner, serum, and moisturizer. 100% organic ingredients, cruelty-free, and suitable for all skin types.", shortDescription: "Complete organic skincare routine set", price: "89.99", compareAtPrice: "119.99", quantity: 180, tags: "skincare,organic,gift,set,beauty", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.6", reviewCount: 423, seoTitle: "Organic Skincare Gift Set | Natural Beauty", seoKeywords: "skincare, organic, gift set, natural beauty", categoryId: 5, brandId: 5 },
    { name: "Professional Hair Dryer Ionic Pro", slug: "hair-dryer-ionic-pro", sku: "HDIP-001", description: "Salon-grade ionic hair dryer with 3 heat settings, cool shot button, and diffuser attachment. Reduces frizz by 75%.", shortDescription: "Salon-grade ionic hair dryer with diffuser", price: "119.99", compareAtPrice: "159.99", quantity: 150, tags: "hair-dryer,ionic,salon,professional", status: "active" as const, isFeatured: false, isTrending: false, rating: "4.5", reviewCount: 289, seoTitle: "Ionic Hair Dryer Pro | Salon Quality", seoKeywords: "hair dryer, ionic, professional, salon", categoryId: 5, brandId: 5 },
    { name: "Bestselling Fiction Collection (Set of 5)", slug: "bestselling-fiction-collection", sku: "BFC-005", description: "Curated collection of 5 award-winning novels. Hardcover editions with exclusive slipcase. Perfect gift for book lovers.", shortDescription: "5 award-winning novels in hardcover with slipcase", price: "79.99", compareAtPrice: "99.99", quantity: 100, tags: "books,fiction,bestseller,collection,gift", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.8", reviewCount: 178, seoTitle: "Bestselling Fiction Collection | 5 Award-Winning Novels", seoKeywords: "books, fiction, bestseller, collection", categoryId: 6, brandId: 6 },
    { name: "Strategy Board Game Deluxe Edition", slug: "strategy-board-game-deluxe", sku: "SBGD-001", description: "Award-winning strategy game for 2-6 players. Beautiful wooden components, 90+ minute gameplay. Perfect for game nights.", shortDescription: "Award-winning strategy board game for 2-6 players", price: "69.99", compareAtPrice: "89.99", quantity: 200, tags: "board-game,strategy,deluxe,family", status: "active" as const, isFeatured: false, isTrending: false, rating: "4.9", reviewCount: 445, seoTitle: "Strategy Board Game Deluxe | Award-Winning", seoKeywords: "board game, strategy, family game, deluxe", categoryId: 7, brandId: 7 },
    { name: "Wireless Charging Car Mount", slug: "wireless-charging-car-mount", sku: "WCCM-001", description: "15W fast wireless charging with auto-clamp mechanism. 360-degree rotation, works with all Qi-enabled phones. Easy one-hand operation.", shortDescription: "15W wireless charging car mount with auto-clamp", price: "49.99", compareAtPrice: "69.99", quantity: 250, tags: "car-mount,wireless-charging,auto,phone-holder", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.4", reviewCount: 678, seoTitle: "Wireless Charging Car Mount | 15W Fast Charge", seoKeywords: "car mount, wireless charging, phone holder", categoryId: 8, brandId: 8 },
    { name: "4K Dash Cam with GPS & WiFi", slug: "4k-dash-cam-gps-wifi", sku: "DC4K-001", description: "Crystal clear 4K recording, built-in GPS tracking, WiFi connectivity, and parking mode. Loop recording with G-sensor collision detection.", shortDescription: "4K dash cam with GPS, WiFi and parking mode", price: "199.99", compareAtPrice: "259.99", quantity: 90, tags: "dash-cam,4K,GPS,WiFi,car", status: "active" as const, isFeatured: false, isTrending: false, rating: "4.6", reviewCount: 234, seoTitle: "4K Dash Cam | GPS & WiFi Enabled", seoKeywords: "dash cam, 4K, GPS, WiFi, car camera", categoryId: 8, brandId: 8 },
    { name: "Mechanical Keyboard RGB Hot-Swappable", slug: "mechanical-keyboard-rgb", sku: "MKR-001", description: "Premium hot-swappable mechanical keyboard with Gateron switches, per-key RGB lighting, and CNC aluminum frame. Programmable macros.", shortDescription: "Hot-swappable mechanical keyboard with RGB", price: "159.99", compareAtPrice: "209.99", quantity: 130, tags: "keyboard,mechanical,RGB,gaming,hot-swap", status: "active" as const, isFeatured: true, isTrending: true, rating: "4.8", reviewCount: 389, seoTitle: "Mechanical Keyboard RGB | Hot-Swappable", seoKeywords: "mechanical keyboard, RGB, hot-swappable, gaming", categoryId: 1, brandId: 1 },
    { name: "Men's Slim Fit Wool Blazer", slug: "mens-slim-wool-blazer", sku: "MSFWB-001", description: "Italian wool blend slim fit blazer with satin lining. Perfect for business meetings or smart casual occasions.", shortDescription: "Italian wool slim fit blazer", price: "249.99", compareAtPrice: "349.99", quantity: 60, tags: "blazer,wool,slim-fit,mens,fashion", status: "active" as const, isFeatured: false, isTrending: false, rating: "4.5", reviewCount: 134, seoTitle: "Men's Wool Blazer | Italian Slim Fit", seoKeywords: "blazer, wool, slim fit, mens fashion", categoryId: 2, brandId: 2 },
    { name: "Ceramic Coffee Mug Set of 4", slug: "ceramic-coffee-mug-set", sku: "CCMS-004", description: "Handmade ceramic mugs in assorted earth tones. 12oz capacity, microwave and dishwasher safe. Perfect for your morning coffee ritual.", shortDescription: "Handmade ceramic coffee mugs set of 4", price: "34.99", compareAtPrice: "49.99", quantity: 400, tags: "mugs,ceramic,coffee,kitchen,set", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.7", reviewCount: 756, seoTitle: "Ceramic Coffee Mug Set | Handmade", seoKeywords: "coffee mugs, ceramic, handmade, kitchen", categoryId: 3, brandId: 3 },
    { name: "Resistance Bands Set (11pc)", slug: "resistance-bands-set-11pc", sku: "RBS-011", description: "Complete resistance band set with 5 bands, handles, ankle straps, and door anchor. Stackable up to 150lbs. Includes carrying case.", shortDescription: "11pc resistance bands set up to 150lbs", price: "29.99", compareAtPrice: "44.99", quantity: 600, tags: "resistance-bands,fitness,workout,home-gym", status: "active" as const, isFeatured: false, isTrending: true, rating: "4.6", reviewCount: 1023, seoTitle: "Resistance Bands Set 11pc | Up to 150lbs", seoKeywords: "resistance bands, workout, home gym, fitness", categoryId: 4, brandId: 4 },
    { name: "Vitamin C Serum 20% with Hyaluronic Acid", slug: "vitamin-c-serum-20", sku: "VCS-020", description: "Clinical strength 20% Vitamin C serum with hyaluronic acid and Vitamin E. Brightens skin, reduces fine lines, and fades dark spots.", shortDescription: "20% Vitamin C serum with hyaluronic acid", price: "24.99", compareAtPrice: "39.99", quantity: 800, tags: "vitamin-c,serum,skincare,anti-aging", status: "active" as const, isFeatured: false, isTrending: false, rating: "4.5", reviewCount: 2345, seoTitle: "Vitamin C Serum 20% | Anti-Aging Formula", seoKeywords: "vitamin C serum, hyaluronic acid, skincare", categoryId: 5, brandId: 5 },
    { name: "Wireless Gaming Mouse 25K DPI", slug: "wireless-gaming-mouse-25k", sku: "WGM-25K", description: "Ultra-lightweight wireless gaming mouse with 25K DPI sensor, 70-hour battery, and customizable RGB. Weighs only 63g.", shortDescription: "Ultra-light 25K DPI wireless gaming mouse", price: "89.99", compareAtPrice: "119.99", quantity: 175, tags: "gaming-mouse,wireless,RGB,lightweight", status: "active" as const, isFeatured: true, isTrending: true, rating: "4.7", reviewCount: 567, seoTitle: "Wireless Gaming Mouse 25K DPI | Ultra-Light", seoKeywords: "gaming mouse, wireless, 25K DPI, lightweight", categoryId: 1, brandId: 1 },
    { name: "Women's Running Jacket Waterproof", slug: "womens-running-jacket", sku: "WRJ-001", description: "Lightweight waterproof running jacket with reflective details and ventilation panels. Packable into its own pocket.", shortDescription: "Waterproof packable running jacket", price: "79.99", compareAtPrice: "109.99", quantity: 140, tags: "jacket,running,waterproof,womens,fitness", status: "active" as const, isFeatured: false, isTrending: false, rating: "4.4", reviewCount: 198, seoTitle: "Women's Running Jacket | Waterproof & Packable", seoKeywords: "running jacket, waterproof, womens, fitness", categoryId: 2, brandId: 2 },
  ];

  for (const prod of productData) {
    try {
      const [result] = await db.insert(products).values({ ...prod, sellerId: 1 });
      const productId = Number(result.insertId);

      // Add product images
      await db.insert(productImages).values({
        productId,
        imageUrl: `https://images.unsplash.com/photo-${getProductImage(prod.slug)}?w=600`,
        altText: prod.name,
        isPrimary: true,
        sortOrder: 0,
      });

      // Add a secondary image
      await db.insert(productImages).values({
        productId,
        imageUrl: `https://images.unsplash.com/photo-${getSecondaryImage(prod.slug)}?w=600`,
        altText: `${prod.name} - view 2`,
        isPrimary: false,
        sortOrder: 1,
      });
    } catch (err) {
      console.log(`Product ${prod.slug} may already exist`);
    }
  }
  console.log("Products seeded");

  // Seed banners
  const bannerData = [
    { title: "Summer Tech Sale", subtitle: "Up to 50% off on premium electronics", imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200", linkUrl: "/products?category=electronics", position: "hero" as const, sortOrder: 1, isActive: true },
    { title: "New Fashion Arrivals", subtitle: "Discover the latest trends", imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200", linkUrl: "/products?category=fashion", position: "hero" as const, sortOrder: 2, isActive: true },
    { title: "Home Makeover", subtitle: "Transform your living space", imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200", linkUrl: "/products?category=home-living", position: "hero" as const, sortOrder: 3, isActive: true },
  ];

  for (const banner of bannerData) {
    try {
      await db.insert(banners).values(banner);
    } catch {
      // May already exist
    }
  }
  console.log("Banners seeded");

  // Seed coupons
  const couponData = [
    { code: "WELCOME20", description: "20% off your first order", discountType: "percentage" as const, discountValue: "20.00", minPurchase: "50.00", maxDiscount: "50.00", usageLimit: 1000 },
    { code: "SUMMER50", description: "$50 off orders over $200", discountType: "fixed_amount" as const, discountValue: "50.00", minPurchase: "200.00", usageLimit: 500 },
    { code: "FREESHIP", description: "Free shipping on all orders", discountType: "fixed_amount" as const, discountValue: "9.99", minPurchase: "25.00", usageLimit: 2000 },
    { code: "VIP15", description: "15% off for VIP members", discountType: "percentage" as const, discountValue: "15.00", minPurchase: "0.00", maxDiscount: "100.00", usageLimit: 500 },
  ];

  for (const coupon of couponData) {
    try {
      await db.insert(coupons).values(coupon);
    } catch {
      // May already exist
    }
  }
  console.log("Coupons seeded");

  // Seed some reviews
  const reviewComments = [
    "Absolutely love this product! Exceeded my expectations.",
    "Great quality for the price. Highly recommend!",
    "Fast shipping and excellent customer service.",
    "This is my second purchase. Very satisfied!",
    "Good product but shipping took longer than expected.",
    "Perfect! Exactly as described in the listing.",
    "Amazing quality. Will definitely buy again.",
    "Decent product for the price. Nothing extraordinary.",
    "Best purchase I've made this year!",
    "Works great! No complaints at all.",
  ];

  for (let productId = 1; productId <= 24; productId++) {
    const numReviews = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numReviews; i++) {
      try {
        await db.insert(reviews).values({
          productId,
          userId: 1,
          rating: 3 + Math.floor(Math.random() * 3),
          title: reviewComments[i % reviewComments.length].slice(0, 50),
          content: reviewComments[i % reviewComments.length],
          status: "approved",
          isVerified: Math.random() > 0.3,
        });
      } catch {
        // May fail due to constraints
      }
    }
  }
  console.log("Reviews seeded");

  console.log("Seed complete!");
}

// Helper to get consistent product images
function getProductImage(slug: string): string {
  const imageMap: Record<string, string> = {
    "wireless-headphones-pro": "1505740428086-20",
    "smart-watch-ultra-5": "1523275335684-20",
    "ultra-slim-laptop-pro": "1496181133206-80",
    "bluetooth-speaker-360": "1608043152269-20",
    "designer-leather-crossbody": "1548036328-20",
    "premium-cotton-tshirt": "1521572163504-20",
    "running-sneakers-elite": "1542291026-20",
    "modern-velvet-accent-chair": "1567538093583-20",
    "smart-led-floor-lamp": "1507473885765-20",
    "yoga-mat-premium": "1592432678016-20",
    "adjustable-dumbbells-set": "1534438327276-20",
    "organic-skincare-gift-set": "1556228576-20",
    "hair-dryer-ionic-pro": "1522338242992-20",
    "bestselling-fiction-collection": "1512820790803-20",
    "strategy-board-game-deluxe": "1566576912321-20",
    "wireless-charging-car-mount": "1558618669-20",
    "4k-dash-cam-gps-wifi": "1494976388531-20",
    "mechanical-keyboard-rgb": "1595225476474-20",
    "mens-slim-wool-blazer": "1507679799987-20",
    "ceramic-coffee-mug-set": "1514228743687-20",
    "resistance-bands-set-11pc": "159828684-20",
    "vitamin-c-serum-20": "16209165617-20",
    "wireless-gaming-mouse-25k": "15278140592-20",
    "womens-running-jacket": "1544022616-20",
  };
  return imageMap[slug] || "1550009158-9ebf69173e03";
}

function getSecondaryImage(slug: string): string {
  const imageMap: Record<string, string> = {
    "wireless-headphones-pro": "1484704849700-20",
    "smart-watch-ultra-5": "1434493789847-20",
    "ultra-slim-laptop-pro": "1517336714731-20",
    "bluetooth-speaker-360": "1545454675-20",
    "designer-leather-crossbody": "15849178654-20",
    "premium-cotton-tshirt": "1576566588028-20",
    "running-sneakers-elite": "1542291026-20",
    "modern-velvet-accent-chair": "1555046898-20",
    "smart-led-floor-lamp": "15135060039-20",
    "yoga-mat-premium": "15999018609-20",
    "adjustable-dumbbells-set": "15834541155-20",
    "organic-skincare-gift-set": "15717819266-20",
    "hair-dryer-ionic-pro": "15223373678-20",
    "bestselling-fiction-collection": "14954468159-20",
    "strategy-board-game-deluxe": "16108907163-20",
    "wireless-charging-car-mount": "15493176612-20",
    "4k-dash-cam-gps-wifi": "14499654066-20",
    "mechanical-keyboard-rgb": "15878297413-20",
    "mens-slim-wool-blazer": "15076797999-20",
    "ceramic-coffee-mug-set": "14954744722-20",
    "resistance-bands-set-11pc": "15178363574-20",
    "vitamin-c-serum-20": "15562287230-20",
    "wireless-gaming-mouse-25k": "15278645503-20",
    "womens-running-jacket": "15391854416-20",
  };
  return imageMap[slug] || "1550009158-9ebf69173e03";
}

seed().catch(console.error);

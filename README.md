# NexusAI Commerce

A full-stack AI-powered e-commerce platform with customer storefront, seller hub, and admin panel.

## Stack

- **Frontend** — React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts
- **Data** — tRPC for end-to-end type safety
- **Auth** — OAuth via Kimi
- **AI** — Product recommendations, review summarization, seller listing tools

## Getting started

```bash
npm install
npm run dev
```

Environment variables required:

```
VITE_KIMI_AUTH_URL=
VITE_APP_ID=
```

## Structure

```
src/
  components/
    layout/       # Navbar, AdminLayout, SellerLayout
    ui/           # shadcn/ui primitives
    ui-custom/    # ProductCard, GlassCard, StarRating, AIChatbot
  hooks/          # useAuth, use-toast, use-mobile
  lib/            # utils, helpers, validation, seo
  pages/
    admin/        # Dashboard, Orders, Products, Users, etc.
    customer/     # Home, Products, ProductDetail, Cart, Checkout, etc.
    seller/       # Dashboard, Products, Orders, Analytics, AI Tools
  providers/      # tRPC client
```

## Features

- **Customer** — AI-personalized product feed, search, cart, checkout, wishlist, order tracking, notifications
- **Seller** — Inventory management, order fulfilment, sales analytics, AI listing & trend tools
- **Admin** — Platform analytics, user/seller management, moderation, banners, coupons

## Design system

Custom design tokens in `index.css` — surface cards, brand gradient text, pill badges, field inputs, and nav items are all utility classes rather than scattered inline styles.

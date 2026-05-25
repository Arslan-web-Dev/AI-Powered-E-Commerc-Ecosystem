import { Link } from "react-router";
import { ArrowRight, TrendingUp, Zap, Shield, Truck, Headphones, Star, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ui-custom/ProductCard";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { useAuth } from "@/hooks/useAuth";

const FEATURES = [
  { icon: Zap, label: "AI Recommendations", desc: "Picks tailored to your taste" },
  { icon: Shield, label: "Secure Checkout", desc: "256-bit encryption" },
  { icon: Truck, label: "Fast Delivery", desc: "Free on orders over $100" },
  { icon: Headphones, label: "24/7 Support", desc: "Human + AI assistance" },
];

export default function Home() {
  const { user } = useAuth();
  const { data: featured } = trpc.product.featured.useQuery();
  const { data: trending } = trpc.product.trending.useQuery();
  const { data: categories } = trpc.category.list.useQuery();
  const { data: aiRecommendations } = trpc.ai.recommendations.useQuery(
    user?.id ? { userId: user.id, limit: 4 } : { limit: 4 }
  );

  return (
    <div className="space-y-14 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080c18] via-[#080c18]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c18] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 px-8 py-24 md:py-36 max-w-2xl fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/12 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-5">
            <Sparkles size={11} />
            AI-Powered Shopping
          </div>
          <h1 className="text-4xl md:text-[58px] font-bold text-white leading-[1.08] tracking-tight">
            Commerce,{" "}
            <br />
            <span className="brand-text">reimagined.</span>
          </h1>
          <p className="mt-5 text-[15px] text-white/50 max-w-md leading-relaxed">
            Smart recommendations, intelligent search, and a marketplace built to help you discover things you'll actually love.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary flex items-center gap-2">
              Shop now <ArrowRight size={16} />
            </Link>
            <Link to="/seller/register" className="btn-ghost flex items-center gap-2">
              Sell with us
            </Link>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map((feat, i) => (
            <GlassCard
              key={feat.label}
              className="p-5 text-center fade-in"
              style={{ animationDelay: `${i * 60}ms` } as React.CSSProperties}
              interactive
            >
              <div
                className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))" }}
              >
                <feat.icon size={20} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-white/85">{feat.label}</p>
              <p className="text-xs text-white/35 mt-1">{feat.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Browse categories</h2>
            <Link to="/categories" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.slice(0, 8).map((cat, i) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <GlassCard className="group cursor-pointer overflow-hidden" interactive>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400"}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{cat.name}</h3>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI picks */}
      {aiRecommendations && aiRecommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-none">Picked for you</h2>
              <p className="text-xs text-white/35 mt-0.5">AI-personalized suggestions</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {aiRecommendations.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} showReason />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              <h2 className="text-xl font-bold text-white">Featured</h2>
            </div>
            <Link to="/products?featured=true" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featured.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending && trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Trending now</h2>
            </div>
            <Link to="/products?trending=true" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trending.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Seller CTA */}
      <section className="relative overflow-hidden rounded-2xl px-8 py-14 text-center">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.07), rgba(236,72,153,0.04))" }}
        />
        <div className="relative z-10 fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to start selling?</h2>
          <p className="text-white/45 max-w-md mx-auto mb-7 text-sm leading-relaxed">
            NexusAI gives sellers AI-powered tools to write listings, predict trends, and grow faster.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/seller/register" className="btn-primary">
              Open your store
            </Link>
            <Link to="/products" className="btn-ghost">
              Keep shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

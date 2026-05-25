import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, TrendingUp, Zap, Shield, Truck, Headphones, Star, Sparkles, ChevronRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/ui-custom/ProductCard";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const { data: featured } = trpc.product.featured.useQuery();
  const { data: trending } = trpc.product.trending.useQuery();
  const { data: categories } = trpc.category.list.useQuery();
  const { data: aiRecommendations } = trpc.ai.recommendations.useQuery(
    user?.id ? { userId: user.id, limit: 4 } : { limit: 4 }
  );

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 px-8 py-24 md:py-32 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
              <Sparkles size={12} />
              AI-Powered Shopping Experience
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Discover the Future of{" "}
              <span className="gradient-text">E-Commerce</span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 max-w-xl leading-relaxed">
              Shop smarter with AI-powered recommendations, intelligent search, and personalized experiences. Over 10,000 premium products from verified sellers.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Explore Products
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/seller/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-300 border border-white/[0.1] hover:bg-white/[0.05] hover:text-white transition-all"
              >
                Become a Seller
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "AI Recommendations", desc: "Smart product suggestions" },
            { icon: Shield, label: "Secure Payments", desc: "256-bit encryption" },
            { icon: Truck, label: "Fast Shipping", desc: "Free over $100" },
            { icon: Headphones, label: "24/7 Support", desc: "AI + Human assistance" },
          ].map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <GlassCard className="p-5 text-center" hover>
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))" }}>
                  <feat.icon size={22} className="text-purple-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{feat.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{feat.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Browse Categories</h2>
          <Link to="/categories" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories?.slice(0, 8).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link to={`/products?categoryId=${cat.id}`}>
                <GlassCard className="group cursor-pointer overflow-hidden" hover>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400"}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{cat.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.description?.slice(0, 40)}...</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Recommendations */}
      {aiRecommendations && aiRecommendations.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Picked For You</h2>
              <p className="text-sm text-gray-500">Personalized recommendations powered by AI</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aiRecommendations.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} showReason />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Star size={20} className="text-amber-400 fill-amber-400" />
            <h2 className="text-2xl font-bold text-white">Featured Products</h2>
          </div>
          <Link to="/products?featured=true" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured?.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          </div>
          <Link to="/products?trending=true" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trending?.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1), rgba(236,72,153,0.05))" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5" />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Join thousands of sellers on NexusAI Commerce. Our AI-powered tools help you optimize listings, predict trends, and grow your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/seller/register"
                className="px-8 py-3 rounded-xl font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Become a Seller
              </Link>
              <Link
                to="/products"
                className="px-8 py-3 rounded-xl font-medium text-gray-300 border border-white/[0.1] hover:bg-white/[0.05] hover:text-white transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

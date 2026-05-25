import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function Categories() {
  const { data: categories, isLoading } = trpc.category.list.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <GlassCard key={i} className="animate-pulse aspect-[4/3]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Browse Categories</h1>
        <p className="text-gray-400">Explore our wide range of product categories</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories?.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link to={`/products?categoryId=${cat.id}`}>
              <GlassCard className="group cursor-pointer overflow-hidden h-full" hover>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400"}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-purple-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <GlassCard className="p-8 text-center">
        <Sparkles size={32} className="mx-auto text-purple-400 mb-3" />
        <h2 className="text-xl font-semibold text-white mb-2">Can't find what you're looking for?</h2>
        <p className="text-gray-400 text-sm mb-4">Our AI assistant can help you discover the perfect products.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          Browse All Products
        </Link>
      </GlassCard>
    </div>
  );
}

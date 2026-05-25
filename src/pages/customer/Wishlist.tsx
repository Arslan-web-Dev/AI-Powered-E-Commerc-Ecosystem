import { Link } from "react-router";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { StarRating } from "@/components/ui-custom/StarRating";

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: wishlist, isLoading } = trpc.wishlist.list.useQuery(undefined, { enabled: isAuthenticated });
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: () => { utils.wishlist.list.invalidate(); toast({ title: "Removed from wishlist" }); },
  });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => { toast({ title: "Added to cart!" }); utils.cart.get.invalidate(); },
  });

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-12 text-center">
        <Heart size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Login to view your wishlist</h2>
        <Link to="/login" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Login</Link>
      </GlassCard>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i} className="animate-pulse aspect-square" />
        ))}
      </div>
    );
  }

  if (!wishlist?.length) {
    return (
      <GlassCard className="p-12 text-center">
        <Heart size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Your wishlist is empty</h2>
        <p className="text-gray-400 mb-6">Save items you love for later.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Explore Products</Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((item, i) => {
          if (!item.product) return null;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="group h-full" hover>
                <Link to={`/product/${item.product.slug}`}>
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    <img src={item.product?.primaryImage?.imageUrl || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400"} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${item.product.slug}`}>
                    <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-purple-300 transition-colors">{item.product.name}</h3>
                  </Link>
                  <div className="mt-2">
                    <StarRating rating={Number(item.product.rating ?? 0)} reviewCount={item.product.reviewCount ?? 0} />
                  </div>
                  <p className="text-lg font-bold text-white mt-2">${Number(item.product.price).toFixed(2)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart.mutate({ productId: item.productId, quantity: 1 })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-white"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist.mutate({ productId: item.productId })}
                      className="p-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

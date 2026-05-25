import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { StarRating } from "./StarRating";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    rating: string | null;
    reviewCount: number | null;
    status: string;
    primaryImage?: { imageUrl: string; altText: string | null } | null;
    images?: { imageUrl: string; altText: string | null }[];
    reason?: string;
  };
  index?: number;
  showReason?: boolean;
}

export function ProductCard({ product, index = 0, showReason = false }: ProductCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast({ title: "Added to cart!" });
      utils.cart.get.invalidate();
    },
  });

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      toast({ title: data.added ? "Added to wishlist!" : "Removed from wishlist!" });
      utils.wishlist.list.invalidate();
    },
  });

  const imageUrl = product.primaryImage?.imageUrl || product.images?.[0]?.imageUrl || `https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please login to add items to cart", variant: "destructive" });
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Please login to add to wishlist", variant: "destructive" });
      return;
    }
    toggleWishlist.mutate({ productId: product.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <GlassCard className="group cursor-pointer h-full" hover>
        <div onClick={() => navigate(`/product/${product.slug}`)}>
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-xl">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <button
                onClick={handleToggleWishlist}
                className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-purple-500/80 transition-colors"
              >
                <Heart size={16} className="text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
                className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-purple-500/80 transition-colors"
              >
                <Eye size={16} className="text-white" />
              </button>
            </div>

            {showReason && product.reason && (
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-purple-500/80 backdrop-blur-sm text-xs text-white font-medium">
                {product.reason}
              </div>
            )}

            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-500/80 backdrop-blur-sm text-xs text-white font-medium">
                {Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)}% OFF
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-white/90 line-clamp-2 min-h-[2.5rem] group-hover:text-purple-300 transition-colors">
              {product.name}
            </h3>

            <div className="mt-2">
              <StarRating rating={Number(product.rating ?? 0)} reviewCount={product.reviewCount ?? 0} />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">${Number(product.price).toFixed(2)}</span>
                {product.compareAtPrice && Number(product.compareAtPrice) > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    ${Number(product.compareAtPrice).toFixed(2)}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="p-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
              >
                <ShoppingCart size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

import { Heart, ShoppingCart, Eye } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { StarRating } from "./StarRating";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { useToast } from "@/hooks/use-toast";

interface Props {
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

const FALLBACK_IMG = "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400";

export function ProductCard({ product, index = 0, showReason = false }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast({ title: "Added to cart" });
      utils.cart.get.invalidate();
    },
  });

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (res) => {
      toast({ title: res.added ? "Saved to wishlist" : "Removed from wishlist" });
      utils.wishlist.list.invalidate();
    },
  });

  const img = product.primaryImage?.imageUrl || product.images?.[0]?.imageUrl || FALLBACK_IMG;
  const price = Number(product.price);
  const compare = Number(product.compareAtPrice);
  const discountPct = compare > price ? Math.round((1 - price / compare) * 100) : 0;

  const handleCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in to add items to your cart", variant: "destructive" });
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in to save items", variant: "destructive" });
      return;
    }
    toggleWishlist.mutate({ productId: product.id });
  };

  return (
    <div className="fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      <GlassCard className="group h-full" interactive>
        <div onClick={() => navigate(`/product/${product.slug}`)}>
          <div className="relative aspect-square overflow-hidden rounded-t-xl">
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
              <button
                onClick={handleWishlist}
                className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-rose-500/70 transition-colors"
              >
                <Heart size={14} className="text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
                className="p-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-indigo-500/70 transition-colors"
              >
                <Eye size={14} className="text-white" />
              </button>
            </div>

            {showReason && product.reason && (
              <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-purple-600/75 backdrop-blur-sm text-[10px] text-white font-medium">
                {product.reason}
              </div>
            )}

            {discountPct > 0 && (
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-rose-500/75 backdrop-blur-sm text-[10px] text-white font-semibold">
                -{discountPct}%
              </div>
            )}
          </div>

          <div className="p-3.5">
            <h3 className="text-sm font-medium text-white/85 line-clamp-2 min-h-[2.4rem] group-hover:text-purple-300 transition-colors leading-snug">
              {product.name}
            </h3>

            <div className="mt-1.5">
              <StarRating rating={Number(product.rating ?? 0)} reviewCount={product.reviewCount ?? 0} />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white">${price.toFixed(2)}</span>
                {compare > 0 && (
                  <span className="text-xs text-white/30 line-through">${compare.toFixed(2)}</span>
                )}
              </div>
              <button
                onClick={handleCart}
                disabled={addToCart.isPending}
                className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all hover:shadow-md hover:shadow-purple-500/20 disabled:opacity-40"
              >
                <ShoppingCart size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { StarRating } from "@/components/ui-custom/StarRating";
import { ProductCard } from "@/components/ui-custom/ProductCard";

const GUARANTEES = [
  { icon: Truck,     label: "Free shipping",  desc: "On orders over $100" },
  { icon: Shield,    label: "2-year warranty",desc: "Full parts & labour" },
  { icon: RotateCcw, label: "30-day returns", desc: "No questions asked" },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const { data: aiSummary } = trpc.ai.reviewSummary.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product }
  );

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => toast({ title: "Added to cart" }),
  });
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (r) => toast({ title: r.added ? "Saved to wishlist" : "Removed from wishlist" }),
  });

  const requireAuth = (fn: () => void) => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to continue", variant: "destructive" });
      return;
    }
    fn();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-white/[0.04] rounded-xl" />
          <div className="space-y-4 pt-4">
            <div className="h-5 bg-white/[0.04] rounded w-3/4" />
            <div className="h-4 bg-white/[0.04] rounded w-1/3" />
            <div className="h-8 bg-white/[0.04] rounded w-1/4 mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <GlassCard className="p-12 text-center">
        <p className="text-white/40 mb-4">Product not found.</p>
        <button onClick={() => navigate("/products")} className="text-sm text-indigo-400 hover:underline">
          Browse all products
        </button>
      </GlassCard>
    );
  }

  const images = product.images || [];
  const price = Number(product.price);
  const compare = Number(product.compareAtPrice);
  const discountPct = compare > price ? Math.round((1 - price / compare) * 100) : 0;
  const stock = product.quantity ?? 0;

  const stockLabel = stock > 10 ? "In stock" : stock > 0 ? `Only ${stock} left` : "Out of stock";
  const stockColor = stock > 10 ? "text-emerald-400" : stock > 0 ? "text-amber-400" : "text-rose-400";

  const sentimentClass: Record<string, string> = {
    positive: "pill pill-green",
    negative: "pill pill-red",
    neutral:  "pill pill-yellow",
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-white/35">
        <button onClick={() => navigate("/")} className="hover:text-white/70 transition-colors">Home</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate("/products")} className="hover:text-white/70 transition-colors">Products</button>
        <ChevronRight size={12} />
        <span className="text-white/55 truncate max-w-[180px]">{product.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden border border-white/[0.07]">
            <img
              src={images[activeImg]?.imageUrl || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImg === i ? "border-indigo-500" : "border-white/[0.07] hover:border-white/20"
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {discountPct > 0 && <span className="pill pill-red">-{discountPct}%</span>}
              {product.isTrending && <span className="pill pill-green">Trending</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{product.name}</h1>
            <div className="mt-2">
              <StarRating rating={Number(product.rating ?? 0)} reviewCount={product.reviewCount ?? 0} />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">${price.toFixed(2)}</span>
            {compare > 0 && (
              <span className="text-lg text-white/30 line-through">${compare.toFixed(2)}</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-sm text-white/50 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Qty + stock */}
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-white/[0.08]">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-white/50 hover:text-white transition-colors text-sm">−</button>
              <span className="px-4 py-2 text-sm text-white border-x border-white/[0.08] min-w-[44px] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-white/50 hover:text-white transition-colors text-sm">+</button>
            </div>
            <span className={`text-sm ${stockColor}`}>{stockLabel}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => requireAuth(() => addToCart.mutate({ productId: product.id, quantity: qty }))}
              disabled={addToCart.isPending || stock === 0}
              className="btn-primary flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3"
            >
              <ShoppingCart size={17} />
              {addToCart.isPending ? "Adding…" : "Add to cart"}
            </button>
            <button
              onClick={() => requireAuth(() => toggleWishlist.mutate({ productId: product.id }))}
              className="btn-ghost p-3"
            >
              <Heart size={17} />
            </button>
            <button className="btn-ghost p-3">
              <Share2 size={17} />
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {GUARANTEES.map((g) => (
              <div key={g.label} className="text-center p-3 rounded-lg bg-white/[0.025]">
                <g.icon size={18} className="mx-auto text-indigo-400 mb-1.5" />
                <p className="text-xs font-medium text-white/80">{g.label}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI review summary */}
      {aiSummary && (
        <GlassCard className="p-5" glow>
          <div className="flex items-start gap-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Sparkles size={17} className="text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white">AI review summary</h3>
              <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{aiSummary.summary}</p>
              <div className="flex items-center gap-3 mt-3">
                {aiSummary.sentiment && (
                  <span className={sentimentClass[aiSummary.sentiment] || "pill pill-blue"}>
                    {aiSummary.sentiment.charAt(0).toUpperCase() + aiSummary.sentiment.slice(1)}
                  </span>
                )}
                <StarRating rating={aiSummary.rating} reviewCount={aiSummary.totalReviews} />
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Description */}
      {product.description && (
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
          <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{product.description}</p>
          {product.aiGeneratedDescription && (
            <div className="mt-4 p-4 rounded-lg bg-indigo-500/[0.05] border border-indigo-500/[0.1]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles size={13} className="text-indigo-400" />
                <span className="text-xs font-medium text-indigo-400">AI-enhanced description</span>
              </div>
              <p className="text-sm text-white/45">{product.aiGeneratedDescription}</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* Related products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {product.relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={{ ...p, rating: p.rating ?? "0", reviewCount: p.reviewCount ?? 0 }} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

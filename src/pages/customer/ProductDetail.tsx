import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { StarRating } from "@/components/ui-custom/StarRating";
import { ProductCard } from "@/components/ui-custom/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const { data: aiSummary } = trpc.ai.reviewSummary.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product }
  );

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast({ title: "Added to cart!" });
    },
  });

  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      toast({ title: data.added ? "Added to wishlist!" : "Removed from wishlist!" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <GlassCard className="animate-pulse p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-white/[0.05] rounded-xl" />
            <div className="space-y-4">
              <div className="h-6 bg-white/[0.05] rounded w-3/4" />
              <div className="h-4 bg-white/[0.05] rounded w-1/2" />
              <div className="h-8 bg-white/[0.05] rounded w-1/4" />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!product) {
    return (
      <GlassCard className="p-12 text-center">
        <p className="text-gray-400">Product not found.</p>
        <button onClick={() => navigate("/products")} className="mt-4 text-purple-400 hover:underline">
          Browse all products
        </button>
      </GlassCard>
    );
  }

  const images = product.images || [];
  const discount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate("/products")} className="hover:text-white transition-colors">Products</button>
        <ChevronRight size={14} />
        <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Product */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-xl overflow-hidden border border-white/[0.08]"
          >
            <img
              src={images[selectedImage]?.imageUrl || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? "border-purple-500" : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {discount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-medium">
                  {discount}% OFF
                </span>
              )}
              {product.isTrending && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">
                  Trending
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{product.name}</h1>
            <div className="mt-3">
              <StarRating rating={Number(product.rating ?? 0)} reviewCount={product.reviewCount ?? 0} />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">${Number(product.price).toFixed(2)}</span>
            {product.compareAtPrice && Number(product.compareAtPrice) > 0 && (
              <span className="text-xl text-gray-500 line-through">${Number(product.compareAtPrice).toFixed(2)}</span>
            )}
          </div>

          <p className="text-gray-400 leading-relaxed">{product.shortDescription || product.description?.slice(0, 200)}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Quantity:</span>
            <div className="flex items-center rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm text-white border-x border-white/[0.08] min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
              >
                +
              </button>
            </div>
            <span className={`text-sm ${(product.quantity ?? 0) > 10 ? "text-emerald-400" : (product.quantity ?? 0) > 0 ? "text-amber-400" : "text-rose-400"}`}>
              {(product.quantity ?? 0) > 0 ? `${product.quantity} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (!isAuthenticated) { toast({ title: "Please login first", variant: "destructive" }); return; }
                addToCart.mutate({ productId: product.id, quantity });
              }}
              disabled={addToCart.isPending || (product.quantity ?? 0) === 0}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) { toast({ title: "Please login first", variant: "destructive" }); return; }
                toggleWishlist.mutate({ productId: product.id });
              }}
              className="p-3.5 rounded-xl border border-white/[0.1] text-gray-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
            >
              <Heart size={18} />
            </button>
            <button className="p-3.5 rounded-xl border border-white/[0.1] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all">
              <Share2 size={18} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Free Shipping", desc: "Orders $100+" },
              { icon: Shield, label: "2 Year Warranty", desc: "Full coverage" },
              { icon: RotateCcw, label: "30-Day Returns", desc: "Easy returns" },
            ].map((feat) => (
              <div key={feat.label} className="text-center p-3 rounded-lg bg-white/[0.03]">
                <feat.icon size={20} className="mx-auto text-purple-400 mb-1.5" />
                <p className="text-xs font-medium text-white">{feat.label}</p>
                <p className="text-[10px] text-gray-500">{feat.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Review Summary */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6" glow>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">AI Review Summary</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{aiSummary.summary}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    aiSummary.sentiment === "positive" ? "bg-emerald-500/15 text-emerald-400" :
                    aiSummary.sentiment === "negative" ? "bg-rose-500/15 text-rose-400" :
                    "bg-amber-500/15 text-amber-400"
                  }`}>
                    {aiSummary.sentiment?.charAt(0).toUpperCase()}{aiSummary.sentiment?.slice(1)} Sentiment
                  </span>
                  <StarRating rating={aiSummary.rating} reviewCount={aiSummary.totalReviews} />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Description */}
      {product.description && (
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
          {product.aiGeneratedDescription && (
            <div className="mt-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-xs font-medium text-purple-400">AI-Enhanced Description</span>
              </div>
              <p className="text-sm text-gray-400">{product.aiGeneratedDescription}</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={{...p, rating: p.rating ?? "0", reviewCount: p.reviewCount ?? 0}} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

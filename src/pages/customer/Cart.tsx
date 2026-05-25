import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Tag } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: cart, isLoading } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);

  const updateItem = trpc.cart.update.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });
  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => { utils.cart.get.invalidate(); toast({ title: "Item removed" }); },
  });
  const validateCoupon = trpc.cart.validateCoupon.useQuery(
    { code: couponCode },
    { enabled: false }
  );

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await validateCoupon.refetch();
    if (result.data?.valid && result.data.coupon) {
      const coupon = result.data.coupon;
      const subtotal = cart?.subtotal || 0;
      let discount = 0;
      if (subtotal >= coupon.minPurchase) {
        if (coupon.discountType === "percentage") {
          discount = subtotal * (coupon.discountValue / 100);
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = coupon.discountValue;
        }
        setCouponApplied({ code: coupon.code, discount });
        toast({ title: `Coupon applied! You save $${discount.toFixed(2)}` });
      }
    } else {
      toast({ title: result.data?.message || "Invalid coupon", variant: "destructive" });
    }
  };

  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discount = couponApplied?.discount || 0;
  const total = subtotal + shipping + tax - discount;

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-12 text-center">
        <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Your cart is waiting</h2>
        <p className="text-gray-400 mb-6">Login to view your cart and continue shopping.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          Login
        </Link>
      </GlassCard>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} className="animate-pulse p-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-white/[0.05] rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/[0.05] rounded w-1/2" />
                <div className="h-4 bg-white/[0.05] rounded w-1/4" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          Start Shopping
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Shopping Cart ({cart.itemCount} items)</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, i) => {
            if (!item) return null;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-4">
                  <div className="flex gap-4">
                    <Link to={`/product/${item.product?.slug}`} className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.primaryImage?.imageUrl || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200"}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product?.slug}`} className="text-sm font-medium text-white hover:text-purple-300 transition-colors line-clamp-2">
                        {item.product?.name}
                      </Link>
                      <p className="text-lg font-bold text-white mt-1">${Number(item.product?.price).toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center rounded-lg border border-white/[0.08]">
                          <button
                            onClick={() => updateItem.mutate({ cartItemId: item.id, quantity: item.quantity - 1 })}
                            className="p-1.5 text-gray-400 hover:text-white"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 text-sm text-white border-x border-white/[0.08]">{item.quantity}</span>
                          <button
                            onClick={() => updateItem.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })}
                            className="p-1.5 text-gray-400 hover:text-white"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem.mutate({ cartItemId: item.id })}
                          className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Apply
              </button>
            </div>
            {couponApplied && (
              <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm text-emerald-400">{couponApplied.code} applied</span>
                <button onClick={() => setCouponApplied(null)} className="text-xs text-gray-500 hover:text-white">Remove</button>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-emerald-400" : ""}>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/[0.08] flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout", { state: { couponCode: couponApplied?.code } })}
              className="w-full mt-5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

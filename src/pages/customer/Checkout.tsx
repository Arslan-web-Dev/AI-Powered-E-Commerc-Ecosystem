import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { CreditCard, Truck, ArrowLeft, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: cart } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const couponCode = (location.state as any)?.couponCode;

  const [step, setStep] = useState<"shipping" | "payment" | "confirm">("shipping");
  const [form, setForm] = useState({
    address: "", city: "", country: "", postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "paypal" | "stripe">("credit_card");

  const createOrder = trpc.order.create.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      toast({ title: "Order placed successfully!" });
      navigate("/orders");
    },
    onError: (err) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = () => {
    if (!form.address || !form.city || !form.country) {
      toast({ title: "Please fill in all shipping details", variant: "destructive" });
      return;
    }
    createOrder.mutate({
      shippingAddress: form.address,
      shippingCity: form.city,
      shippingCountry: form.country,
      shippingPostalCode: form.postalCode,
      paymentMethod,
      couponCode: couponCode || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-12 text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Please login to checkout</h2>
        <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          Login
        </button>
      </GlassCard>
    );
  }

  if (!cart?.items?.length) {
    return (
      <GlassCard className="p-12 text-center">
        <h2 className="text-xl font-semibold text-white mb-4">Your cart is empty</h2>
        <button onClick={() => navigate("/products")} className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          Continue Shopping
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to cart
      </button>

      <h1 className="text-2xl font-bold text-white">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4">
        {["shipping", "payment", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? "bg-purple-500 text-white" :
              ["shipping", "payment", "confirm"].indexOf(step) > i ? "bg-emerald-500 text-white" :
              "bg-white/[0.05] text-gray-500"
            }`}>
              {["shipping", "payment", "confirm"].indexOf(step) > i ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-sm capitalize ${step === s ? "text-white" : "text-gray-500"}`}>{s}</span>
            {i < 2 && <div className="w-8 h-px bg-white/[0.08]" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {step === "shipping" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck size={20} className="text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Shipping Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Street Address</label>
                    <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-dark" placeholder="123 Main Street" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">City</label>
                      <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-dark" placeholder="New York" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Country</label>
                      <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-dark" placeholder="United States" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Postal Code</label>
                    <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="input-dark" placeholder="10001" />
                  </div>
                  <button onClick={() => setStep("payment")} className="w-full py-3 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    Continue to Payment
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard size={20} className="text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { id: "credit_card" as const, label: "Credit Card", desc: "Visa, Mastercard, Amex" },
                    { id: "paypal" as const, label: "PayPal", desc: "Pay with your PayPal account" },
                    { id: "stripe" as const, label: "Stripe", desc: "Secure card payment via Stripe" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        paymentMethod === method.id ? "border-purple-500/40 bg-purple-500/10" : "border-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === method.id ? "border-purple-500" : "border-gray-600"
                      }`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep("shipping")} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-gray-300 hover:bg-white/[0.05]">Back</button>
                  <button onClick={() => setStep("confirm")} className="flex-1 py-3 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Review Order</button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Order Confirmation</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-gray-400">Shipping to</span>
                    <span className="text-white text-right">{form.address}, {form.city}, {form.country}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-gray-400">Payment</span>
                    <span className="text-white capitalize">{paymentMethod.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.06]">
                    <span className="text-gray-400">Items</span>
                    <span className="text-white">{cart.itemCount}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep("payment")} className="flex-1 py-3 rounded-xl border border-white/[0.1] text-gray-300 hover:bg-white/[0.05]">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending}
                    className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    {createOrder.isPending ? "Placing Order..." : `Place Order - $${total.toFixed(2)}`}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Summary */}
        <GlassCard className="p-5 h-fit">
          <h3 className="text-sm font-semibold text-white mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            {cart.items.map((item) => {
              if (!item?.product) return null;
              return (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-400 truncate max-w-[150px]">{item.quantity}x {item.product.name}</span>
                  <span className="text-white">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span><span className={shipping === 0 ? "text-emerald-400" : ""}>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.08] flex justify-between text-lg font-bold text-white">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

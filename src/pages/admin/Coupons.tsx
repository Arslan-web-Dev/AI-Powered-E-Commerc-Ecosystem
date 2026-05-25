import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function AdminCoupons() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { data: coupons } = trpc.admin.coupons.useQuery();
  const createCoupon = trpc.admin.createCoupon.useMutation({
    onSuccess: () => { utils.admin.coupons.invalidate(); toast({ title: "Coupon created!" }); setShowForm(false); },
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "", description: "", discountType: "percentage" as const, discountValue: 0,
    minPurchase: 0, maxDiscount: undefined as number | undefined, usageLimit: undefined as number | undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Coupon Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">New Coupon</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="Code" className="input-dark" />
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="input-dark" />
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value as any})} className="input-dark">
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
              <input type="number" value={form.discountValue || ""} onChange={e => setForm({...form, discountValue: Number(e.target.value)})} placeholder="Discount Value" className="input-dark" />
              <input type="number" value={form.minPurchase || ""} onChange={e => setForm({...form, minPurchase: Number(e.target.value)})} placeholder="Min Purchase" className="input-dark" />
              <input type="number" value={form.maxDiscount || ""} onChange={e => setForm({...form, maxDiscount: Number(e.target.value) || undefined})} placeholder="Max Discount (optional)" className="input-dark" />
              <input type="number" value={form.usageLimit || ""} onChange={e => setForm({...form, usageLimit: Number(e.target.value) || undefined})} placeholder="Usage Limit (optional)" className="input-dark" />
              <button onClick={() => createCoupon.mutate(form)} disabled={!form.code || !form.discountValue} className="py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50 md:col-span-2" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Create Coupon
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons?.map((coupon, i) => (
          <motion.div key={coupon.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="p-5" hover>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Tag size={18} className="text-purple-400" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${coupon.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono">{coupon.code}</h3>
              <p className="text-sm text-gray-400 mt-1">{coupon.description}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <p>{coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}</p>
                <p>Min purchase: ${coupon.minPurchase}</p>
                <p>Used {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ""} times</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

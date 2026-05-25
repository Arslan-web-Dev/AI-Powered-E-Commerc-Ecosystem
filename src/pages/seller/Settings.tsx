import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Mail, Save } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function SellerSettings() {
  const { toast } = useToast();
  const { data: seller } = trpc.seller.me.useQuery();

  const [form, setForm] = useState({
    storeName: "", storeDescription: "", businessEmail: "", businessPhone: "", businessAddress: "",
  });

  // Prefill when data loads
  if (seller && !form.storeName && seller.storeName) {
    setForm({
      storeName: seller.storeName,
      storeDescription: seller.storeDescription || "",
      businessEmail: seller.businessEmail || "",
      businessPhone: seller.businessPhone || "",
      businessAddress: seller.businessAddress || "",
    });
  }

  if (!seller) {
    return (
      <GlassCard className="p-12 text-center">
        <Store size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Seller Profile</h2>
        <p className="text-gray-400">Register as a seller to access settings.</p>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Store Settings</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Store size={16} className="text-cyan-400" /> Store Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Store Name</label>
              <input value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} className="input-dark" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea value={form.storeDescription} onChange={e => setForm({...form, storeDescription: e.target.value})} rows={3} className="input-dark resize-none" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Mail size={16} className="text-cyan-400" /> Contact Information</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Business Email</label>
                <input value={form.businessEmail} onChange={e => setForm({...form, businessEmail: e.target.value})} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Business Phone</label>
                <input value={form.businessPhone} onChange={e => setForm({...form, businessPhone: e.target.value})} className="input-dark" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Business Address</label>
              <input value={form.businessAddress} onChange={e => setForm({...form, businessAddress: e.target.value})} className="input-dark" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button
          onClick={() => toast({ title: "Settings saved!" })}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium"
          style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
        >
          <Save size={18} /> Save Settings
        </button>
      </motion.div>
    </div>
  );
}

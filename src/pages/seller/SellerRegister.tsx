import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Store, ArrowRight, CheckCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function SellerRegister() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({
    storeName: "", storeSlug: "", storeDescription: "", businessEmail: "", businessPhone: "", businessAddress: "",
  });

  const register = trpc.seller.register.useMutation({
    onSuccess: () => {
      setStep("success");
      toast({ title: "Application submitted!" });
    },
    onError: (err) => toast({ title: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName || !form.storeSlug) {
      toast({ title: "Store name and slug are required", variant: "destructive" });
      return;
    }
    register.mutate(form);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <GlassCard className="p-12 text-center">
          <Store size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">Login Required</h2>
          <p className="text-gray-400 mb-6">Please login to apply as a seller.</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Login</button>
        </GlassCard>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
            <p className="text-gray-400 mb-6">Your seller application is under review. We'll notify you once approved.</p>
            <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Back to Home</button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Become a Seller</h1>
          <p className="text-gray-400 mt-2">Join thousands of sellers on NexusAI Commerce</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Store Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">Store Name *</label>
                <input value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} className="input-dark" placeholder="My Awesome Store" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">Store Slug *</label>
                <input value={form.storeSlug} onChange={e => setForm({...form, storeSlug: e.target.value.toLowerCase().replace(/\s+/g, "-")})} className="input-dark" placeholder="my-awesome-store" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea value={form.storeDescription} onChange={e => setForm({...form, storeDescription: e.target.value})} rows={3} className="input-dark resize-none" placeholder="Tell customers about your store..." />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Business Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Business Email</label>
                <input value={form.businessEmail} onChange={e => setForm({...form, businessEmail: e.target.value})} className="input-dark" placeholder="business@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Business Phone</label>
                <input value={form.businessPhone} onChange={e => setForm({...form, businessPhone: e.target.value})} className="input-dark" placeholder="+1 234 567 890" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">Business Address</label>
                <input value={form.businessAddress} onChange={e => setForm({...form, businessAddress: e.target.value})} className="input-dark" placeholder="123 Business St, City, Country" />
              </div>
            </div>
          </GlassCard>

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            {register.isPending ? "Submitting..." : <><ArrowRight size={18} /> Submit Application</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

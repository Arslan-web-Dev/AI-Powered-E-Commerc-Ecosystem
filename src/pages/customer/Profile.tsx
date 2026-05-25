import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Save } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { Link } from "react-router";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
    postalCode: user?.postalCode || "",
  });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast({ title: "Profile updated!" });
      utils.auth.me.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-12 text-center">
        <User size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Please login to view your profile</h2>
        <Link to="/login" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Login</Link>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="flex items-center gap-4">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`}
          alt={user?.name || "User"}
          className="w-20 h-20 rounded-2xl border-2 border-purple-500/30"
        />
        <div>
          <h2 className="text-xl font-semibold text-white">{user?.name || "User"}</h2>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-purple-400" /> Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-dark pl-9" placeholder="+1 234 567 890" />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-purple-400" /> Shipping Address
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-dark" placeholder="Street address" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">City</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-dark" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Country</label>
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-dark" placeholder="Country" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Postal Code</label>
                <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="input-dark" placeholder="Postal code" />
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button
          onClick={() => updateProfile.mutate(form)}
          disabled={updateProfile.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
        >
          <Save size={18} /> {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>
    </div>
  );
}

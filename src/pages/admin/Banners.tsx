import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function AdminBanners() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { data: banners } = trpc.admin.banners.useQuery();
  const createBanner = trpc.admin.createBanner.useMutation({
    onSuccess: () => { utils.admin.banners.invalidate(); toast({ title: "Banner created!" }); setShowForm(false); },
  });
  const deleteBanner = trpc.admin.deleteBanner.useMutation({
    onSuccess: () => { utils.admin.banners.invalidate(); toast({ title: "Banner deleted!" }); },
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "hero" as const });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Banner Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4">New Banner</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" className="input-dark" />
              <input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} placeholder="Subtitle" className="input-dark" />
              <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="Image URL" className="input-dark" />
              <input value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} placeholder="Link URL" className="input-dark" />
              <select value={form.position} onChange={e => setForm({...form, position: e.target.value as any})} className="input-dark">
                <option value="hero">Hero</option>
                <option value="featured">Featured</option>
                <option value="promo">Promo</option>
                <option value="sidebar">Sidebar</option>
              </select>
              <button onClick={() => createBanner.mutate(form)} disabled={!form.title || !form.imageUrl} className="py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                Create Banner
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {banners?.map((banner, i) => (
          <motion.div key={banner.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="overflow-hidden">
              <div className="relative aspect-[16/7] overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold">{banner.title}</h3>
                  <p className="text-xs text-gray-300">{banner.subtitle}</p>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">{banner.position}</span>
                <button onClick={() => deleteBanner.mutate({ id: banner.id })} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

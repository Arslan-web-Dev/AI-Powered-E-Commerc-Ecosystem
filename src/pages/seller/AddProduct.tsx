import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { PlusCircle, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function SellerAddProduct() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { data: categories } = trpc.category.list.useQuery();

  const createProduct = trpc.seller.createProduct.useMutation({
    onSuccess: () => {
      toast({ title: "Product created!" });
      utils.seller.myProducts.invalidate();
      navigate("/seller/products");
    },
    onError: (err) => toast({ title: err.message, variant: "destructive" }),
  });

  const [form, setForm] = useState({
    name: "", slug: "", sku: "", description: "", shortDescription: "",
    price: 0, compareAtPrice: 0, quantity: 0, categoryId: 0, tags: "", status: "draft" as const,
  });
  const [_aiMode, setAiMode] = useState(false);

  const generateAIDescription = trpc.ai.generateDescription.useMutation({
    onSuccess: (data) => {
      setForm(prev => ({ ...prev, description: data.description }));
      setAiMode(false);
      toast({ title: "AI description generated!" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.sku || !form.price || !form.categoryId) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createProduct.mutate({
      ...form,
      images: [{ imageUrl: `https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600`, isPrimary: true }],
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Basic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5">Product Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-dark" placeholder="e.g. Wireless Headphones Pro" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Slug *</label>
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="input-dark" placeholder="wireless-headphones-pro" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">SKU *</label>
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="input-dark" placeholder="WHP-001" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5">Short Description</label>
              <input value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} className="input-dark" placeholder="Brief product summary" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Description</h3>
            <button
              type="button"
              onClick={() => {
                if (!form.name) { toast({ title: "Enter a product name first", variant: "destructive" }); return; }
                generateAIDescription.mutate({ productName: form.name, features: form.shortDescription ? [form.shortDescription] : undefined, tone: "professional" });
              }}
              disabled={generateAIDescription.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
            >
              <Sparkles size={12} /> {generateAIDescription.isPending ? "Generating..." : "AI Generate"}
            </button>
          </div>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={5} className="input-dark w-full resize-none" placeholder="Detailed product description..." />
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Pricing & Inventory</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Price *</label>
              <input type="number" step="0.01" value={form.price || ""} onChange={e => setForm({...form, price: Number(e.target.value)})} className="input-dark" placeholder="99.99" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Compare at Price</label>
              <input type="number" step="0.01" value={form.compareAtPrice || ""} onChange={e => setForm({...form, compareAtPrice: Number(e.target.value)})} className="input-dark" placeholder="129.99" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Quantity *</label>
              <input type="number" value={form.quantity || ""} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className="input-dark" placeholder="100" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Organization</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Category *</label>
              <select value={form.categoryId || ""} onChange={e => setForm({...form, categoryId: Number(e.target.value)})} className="input-dark">
                <option value="">Select category</option>
                {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="input-dark">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1.5">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="input-dark" placeholder="wireless, headphones, premium" />
            </div>
          </div>
        </GlassCard>

        <motion.button
          type="submit"
          disabled={createProduct.isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <PlusCircle size={18} /> {createProduct.isPending ? "Creating..." : "Create Product"}
        </motion.button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, Search, Tag, Wand2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function SellerAITools() {
  const { toast } = useToast();
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "luxury" | "technical">("professional");

  const generateDescription = trpc.ai.generateDescription.useMutation({
    onSuccess: (data) => { setGeneratedDescription(data.description); toast({ title: "Description generated!" }); },
  });
  const generateSeo = trpc.ai.generateSeo.useMutation({
    onSuccess: (data) => { setGeneratedSeo(data); toast({ title: "SEO metadata generated!" }); },
  });

  const [generatedDescription, setGeneratedDescription] = useState("");
  const [generatedSeo, setGeneratedSeo] = useState<{ seoTitle: string; seoDescription: string; keywords: string } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Tools</h1>
        <p className="text-sm text-gray-500 mt-1">Supercharge your listings with AI-powered tools</p>
      </div>

      {/* Description Generator */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Product Description Generator</h2>
              <p className="text-xs text-gray-500">Generate compelling product descriptions with AI</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Product Name</label>
              <input value={productName} onChange={e => setProductName(e.target.value)} className="input-dark" placeholder="e.g. Premium Wireless Headphones" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Features (comma separated)</label>
              <input value={features} onChange={e => setFeatures(e.target.value)} className="input-dark" placeholder="Noise cancelling, 40h battery, premium sound" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1.5">Tone</label>
            <div className="flex gap-2">
              {(["professional", "casual", "luxury", "technical"] as const).map(t => (
                <button key={t} onClick={() => setTone(t)} className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${tone === t ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.06]"}`}>{t}</button>
              ))}
            </div>
          </div>
          <button
            onClick={() => { if (!productName) { toast({ title: "Enter a product name", variant: "destructive" }); return; } generateDescription.mutate({ productName, features: features ? features.split(",").map(f => f.trim()) : undefined, tone }); }}
            disabled={generateDescription.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Wand2 size={16} /> {generateDescription.isPending ? "Generating..." : "Generate Description"}
          </button>

          {generatedDescription && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-purple-400" />
                <span className="text-xs font-medium text-purple-400">Generated Description</span>
              </div>
              <div className="text-sm text-gray-300 whitespace-pre-line">{generatedDescription}</div>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>

      {/* SEO Generator */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
              <Search size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">SEO Metadata Generator</h2>
              <p className="text-xs text-gray-500">Generate optimized SEO titles, descriptions, and keywords</p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <input value={productName} onChange={e => setProductName(e.target.value)} className="input-dark flex-1" placeholder="Product name" />
            <button
              onClick={() => { if (!productName) { toast({ title: "Enter a product name", variant: "destructive" }); return; } generateSeo.mutate({ productName }); }}
              disabled={generateSeo.isPending}
              className="px-5 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
            >
              {generateSeo.isPending ? "Generating..." : "Generate SEO"}
            </button>
          </div>

          {generatedSeo && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-1"><Tag size={12} className="text-emerald-400" /><span className="text-xs font-medium text-emerald-400">SEO Title</span></div>
                <p className="text-sm text-white">{generatedSeo.seoTitle}</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-1"><Search size={12} className="text-emerald-400" /><span className="text-xs font-medium text-emerald-400">Meta Description</span></div>
                <p className="text-sm text-gray-300">{generatedSeo.seoDescription}</p>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-1"><Sparkles size={12} className="text-emerald-400" /><span className="text-xs font-medium text-emerald-400">Keywords</span></div>
                <p className="text-sm text-gray-300">{generatedSeo.keywords}</p>
              </div>
            </motion.div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

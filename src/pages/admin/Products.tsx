import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Eye, Ban } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");

  const { data } = trpc.admin.products.useQuery({ page, limit: 20, status: status as any });
  const utils = trpc.useUtils();
  const updateStatus = trpc.admin.updateProductStatus.useMutation({
    onSuccess: () => utils.admin.products.invalidate(),
  });

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400",
    draft: "bg-amber-500/10 text-amber-400",
    inactive: "bg-gray-500/10 text-gray-400",
    out_of_stock: "bg-rose-500/10 text-rose-400",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Product Moderation</h1>
      <div className="flex gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-dark">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((product, i) => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center">
                        <Package size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">${Number(product.price).toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-400">{product.quantity}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[product.status] || statusColors.draft}`}>{product.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {product.status !== "active" && (
                        <button onClick={() => updateStatus.mutate({ id: product.id, status: "active" })} className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"><Eye size={14} /></button>
                      )}
                      {product.status !== "inactive" && (
                        <button onClick={() => updateStatus.mutate({ id: product.id, status: "inactive" })} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Ban size={14} /></button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

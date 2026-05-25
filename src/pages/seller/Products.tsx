import { Link } from "react-router";
import { motion } from "framer-motion";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui-custom/GlassCard";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  draft: "bg-amber-500/10 text-amber-400",
  inactive: "bg-gray-500/10 text-gray-400",
  out_of_stock: "bg-rose-500/10 text-rose-400",
};

export default function SellerProducts() {
  const { data: products, isLoading } = trpc.seller.myProducts.useQuery();
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const deleteProduct = trpc.seller.deleteProduct.useMutation({
    onSuccess: () => { utils.seller.myProducts.invalidate(); toast({ title: "Product deleted!" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Products</h1>
        <Link to="/seller/products/new" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <GlassCard key={i} className="animate-pulse h-20" />)}</div>
      ) : !products?.length ? (
        <GlassCard className="p-12 text-center">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No products yet</h2>
          <p className="text-gray-400 mb-6">Start adding your first product.</p>
          <Link to="/seller/products/new" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>Add Product</Link>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Sold</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, i) => (
                  <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center overflow-hidden">
                          {product.primaryImage ? <img src={product.primaryImage.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-500" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">${Number(product.price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-400">{product.quantity}</td>
                    <td className="py-3 px-4 text-gray-400">{product.soldCount}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status] || statusColors.draft}`}>{product.status}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Link to={`/seller/products/edit/${product.id}`} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Pencil size={14} /></Link>
                        <button onClick={() => { if (confirm("Delete this product?")) deleteProduct.mutate({ id: product.id }); }} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

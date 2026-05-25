import { motion } from "framer-motion";
import { Store, CheckCircle, XCircle, Clock, PauseCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  approved: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  rejected: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
  suspended: { icon: PauseCircle, color: "text-gray-400", bg: "bg-gray-500/10" },
};

export default function AdminSellers() {
  const { data: sellers } = trpc.adminSeller.list.useQuery();
  const utils = trpc.useUtils();
  const updateStatus = trpc.adminSeller.updateStatus.useMutation({
    onSuccess: () => utils.adminSeller.list.invalidate(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Seller Management</h1>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Store</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Contact</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Sales</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Revenue</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers?.map((seller, i) => {
                const config = statusConfig[seller.status] || statusConfig.pending;
                const Icon = config.icon;
                return (
                  <motion.tr key={seller.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg}`}>
                          <Store size={16} className={config.color} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{seller.storeName}</p>
                          <p className="text-xs text-gray-500">@{seller.storeSlug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-400">{seller.businessEmail}</p>
                      <p className="text-xs text-gray-600">{seller.businessPhone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon size={12} /> {seller.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">{seller.totalSales}</td>
                    <td className="py-3 px-4 text-white">${Number(seller.totalRevenue).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {seller.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus.mutate({ id: seller.id, status: "approved" })} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">Approve</button>
                            <button onClick={() => updateStatus.mutate({ id: seller.id, status: "rejected" })} className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">Reject</button>
                          </>
                        )}
                        {seller.status === "approved" && (
                          <button onClick={() => updateStatus.mutate({ id: seller.id, status: "suspended" })} className="px-2.5 py-1 rounded-lg text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">Suspend</button>
                        )}
                        {seller.status === "suspended" && (
                          <button onClick={() => updateStatus.mutate({ id: seller.id, status: "approved" })} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">Reactivate</button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

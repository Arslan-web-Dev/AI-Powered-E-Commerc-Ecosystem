import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  processing: { icon: Package, color: "text-blue-400", bg: "bg-blue-500/10" },
  shipped: { icon: Truck, color: "text-purple-400", bg: "bg-purple-500/10" },
  delivered: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  cancelled: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
  refunded: { icon: XCircle, color: "text-gray-400", bg: "bg-gray-500/10" },
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data } = trpc.admin.orders.useQuery({ page, limit: 20, status: status || undefined });
  const utils = trpc.useUtils();
  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => utils.admin.orders.invalidate(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Order Management</h1>
      <div className="flex gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-dark">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Order</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((order, i) => {
                const config = statusConfig[order.status] || statusConfig.pending;
                const Icon = config.icon;
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">items</p>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">${Number(order.total).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon size={12} /> {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${order.paymentStatus === "paid" ? "bg-emerald-500/10 text-emerald-400" : order.paymentStatus === "failed" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as any })}
                        className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
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

import { Link } from "react-router";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/ui-custom/GlassCard";

const statusConfig: Record<string, { icon: typeof Package; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", label: "Pending" },
  processing: { icon: Package, color: "text-blue-400", bg: "bg-blue-500/10", label: "Processing" },
  shipped: { icon: Truck, color: "text-purple-400", bg: "bg-purple-500/10", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", label: "Cancelled" },
  refunded: { icon: RotateCcw, color: "text-gray-400", bg: "bg-gray-500/10", label: "Refunded" },
};

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.order.myOrders.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-12 text-center">
        <Package size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Login to view your orders</h2>
        <Link to="/login" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Login</Link>
      </GlassCard>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} className="animate-pulse p-6">
            <div className="h-4 bg-white/[0.05] rounded w-1/3 mb-3" />
            <div className="h-3 bg-white/[0.05] rounded w-1/2" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <GlassCard className="p-12 text-center">
        <Package size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
        <p className="text-gray-400 mb-6">Start shopping to see your orders here.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Browse Products</Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Orders ({orders.length})</h1>
      <div className="space-y-4">
        {orders.map((order, i) => {
          const config = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-white">{order.orderNumber}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        <StatusIcon size={12} /> {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${Number(order.total).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex gap-3 overflow-x-auto">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/[0.08]">
                        <img src={item.productImage || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100"} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View Details
                  </Link>
                  {order.status === "pending" && (
                    <button className="text-sm text-rose-400 hover:text-rose-300 transition-colors">
                      Cancel Order
                    </button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

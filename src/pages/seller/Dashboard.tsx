import { motion } from "framer-motion";
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowRight, PlusCircle } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SellerDashboard() {
  const { data, isLoading } = trpc.seller.dashboard.useQuery();

  if (isLoading || !data) {
    return <div className="space-y-6">{[...Array(3)].map((_, i) => <GlassCard key={i} className="animate-pulse h-28" />)}</div>;
  }

  const { seller, stats, recentOrders, salesChartData } = data;
  const chartData = salesChartData.map(d => ({ date: d.date.slice(5), amount: d.amount }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{seller.storeName}</h1>
          <p className="text-sm text-gray-500">@{seller.storeSlug} &middot; Status: <span className="text-emerald-400">{seller.status}</span></p>
        </div>
        <Link to="/seller/products/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
          <PlusCircle size={16} /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.totalProducts, icon: Package, color: "from-blue-500/20 to-blue-600/10" },
          { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "from-purple-500/20 to-purple-600/10" },
          { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-emerald-500/20 to-emerald-600/10" },
          { label: "Pending Orders", value: stats.pendingOrders, icon: TrendingUp, color: "from-amber-500/20 to-amber-600/10" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-5" hover>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color}`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Sales Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sales Performance (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="sellerGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#sellerGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link to="/seller/orders" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"><ArrowRight size={14} /> View All</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 && <p className="text-gray-500 text-sm">No orders yet.</p>}
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "delivered" ? "bg-emerald-500/10 text-emerald-400" : order.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

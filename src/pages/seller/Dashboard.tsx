import { Package, ShoppingCart, DollarSign, Clock, ArrowRight, PlusCircle } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const statusClass: Record<string, string> = {
  delivered: "pill pill-green",
  pending:   "pill pill-yellow",
  shipped:   "pill pill-blue",
  cancelled: "pill pill-red",
};

export default function SellerDashboard() {
  const { data, isLoading } = trpc.seller.dashboard.useQuery();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} className="animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const { seller, stats, recentOrders, salesChartData } = data;
  const chartData = salesChartData.map((d) => ({ date: d.date.slice(5), amount: d.amount }));

  const statCards = [
    { label: "Products",       value: stats.totalProducts,              icon: Package,     color: "from-blue-500/20 to-blue-600/10" },
    { label: "Total orders",   value: stats.totalOrders,                icon: ShoppingCart,color: "from-purple-500/20 to-purple-600/10" },
    { label: "Revenue",        value: `$${stats.totalRevenue.toFixed(2)}`,icon: DollarSign, color: "from-emerald-500/20 to-emerald-600/10" },
    { label: "Pending",        value: stats.pendingOrders,              icon: Clock,       color: "from-amber-500/20 to-amber-600/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{seller.storeName}</h1>
          <p className="text-xs text-white/35 mt-0.5">
            @{seller.storeSlug} · <span className="text-emerald-400">{seller.status}</span>
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="btn-primary flex items-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
        >
          <PlusCircle size={15} /> Add product
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className="fade-in" style={{ animationDelay: `${i * 55}ms` }}>
            <GlassCard className="p-5" interactive>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-white mt-3 tabular-nums">{value}</p>
              <p className="text-xs text-white/35 mt-0.5">{label}</p>
            </GlassCard>
          </div>
        ))}
      </div>

      <GlassCard className="p-6">
        <h2 className="text-base font-semibold text-white mb-4">Sales — last 30 days</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="sgr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.18)" fontSize={11} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.18)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "rgba(10,14,26,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: 12 }}
              cursor={{ stroke: "rgba(16,185,129,0.2)" }}
            />
            <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#sgr)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recent orders</h2>
          <Link to="/seller/orders" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-white/30 py-4 text-center">No orders yet.</p>
        ) : (
          <div>
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                  <p className="text-xs text-white/35">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={statusClass[order.status] || "pill pill-blue"}>{order.status}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

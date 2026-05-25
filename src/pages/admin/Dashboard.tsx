import { Users, Package, ShoppingCart, DollarSign, Store, MessageSquare, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function StatCard({ label, value, icon: Icon, change, up, color }: {
  label: string; value: string; icon: React.ElementType;
  change: string; up: boolean; color: string;
}) {
  return (
    <GlassCard className="p-5" interactive>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-400" : "text-rose-400"}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-white mt-3 tabular-nums">{value}</p>
      <p className="text-xs text-white/35 mt-0.5">{label}</p>
    </GlassCard>
  );
}

const orderStatusClass: Record<string, string> = {
  delivered: "pill pill-green",
  pending:   "pill pill-yellow",
  cancelled: "pill pill-red",
  shipped:   "pill pill-blue",
};

export default function AdminDashboard() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="animate-pulse h-28" />
          ))}
        </div>
        <GlassCard className="animate-pulse h-80" />
      </div>
    );
  }

  const { stats, salesChartData, recentOrders } = data || {};

  const chartData = salesChartData?.map((d) => ({
    date: d.date.slice(5),
    revenue: Number(d.revenue),
    orders: d.orders,
  })) || [];

  const statCards = [
    { label: "Revenue",  value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,  icon: DollarSign, change: "+12.5%", up: true,  color: "from-emerald-500/20 to-emerald-600/10" },
    { label: "Users",    value: (stats?.totalUsers || 0).toLocaleString(),           icon: Users,       change: "+8.2%",  up: true,  color: "from-blue-500/20 to-blue-600/10" },
    { label: "Orders",   value: (stats?.totalOrders || 0).toLocaleString(),          icon: ShoppingCart,change: "+15.3%",up: true,  color: "from-purple-500/20 to-purple-600/10" },
    { label: "Products", value: (stats?.totalProducts || 0).toLocaleString(),        icon: Package,     change: "+5.1%", up: true,  color: "from-amber-500/20 to-amber-600/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <span className="text-xs text-white/35">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <div key={s.label} className="fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Revenue</h2>
            <p className="text-xs text-white/35 mt-0.5">Last 30 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Orders</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.18)" fontSize={11} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.18)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "rgba(10,14,26,0.96)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: 12 }}
              cursor={{ stroke: "rgba(139,92,246,0.2)" }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revGrad)" dot={false} />
            <Area type="monotone" dataKey="orders"  stroke="#10b981" strokeWidth={2} fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Quick stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Store,        color: "bg-amber-500/10",  text: "text-amber-400",  value: stats?.pendingSellers || 0,  label: "Pending seller approvals" },
          { icon: MessageSquare,color: "bg-rose-500/10",   text: "text-rose-400",   value: stats?.pendingReviews || 0,  label: "Pending reviews" },
          { icon: BarChart3,    color: "bg-cyan-500/10",   text: "text-cyan-400",   value: stats?.totalSellers || 0,    label: "Active sellers" },
        ].map(({ icon: Icon, color, text, value, label }) => (
          <GlassCard key={label} className="p-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
                <Icon size={18} className={text} />
              </div>
              <div>
                <p className="text-xl font-bold text-white tabular-nums">{value}</p>
                <p className="text-xs text-white/35">{label}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Recent orders */}
      <GlassCard className="p-6">
        <h2 className="text-base font-semibold text-white mb-4">Recent orders</h2>
        <div className="space-y-0">
          {recentOrders?.slice(0, 6).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                <p className="text-xs text-white/35">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={orderStatusClass[order.status] || "pill pill-blue"}>{order.status}</span>
                <span className="text-sm font-semibold text-white tabular-nums">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

import { motion } from "framer-motion";
import {
  Users, Package, ShoppingCart, DollarSign, Store, MessageSquare,
  TrendingUp, TrendingDown, BarChart3
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse h-28" />
          ))}
        </div>
        <GlassCard className="animate-pulse h-80" />
      </div>
    );
  }

  const stats = data?.stats;
  const salesData = data?.salesChartData?.map(d => ({
    date: d.date.slice(5),
    revenue: Number(d.revenue),
    orders: d.orders,
  })) || [];

  const statCards = [
    { label: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, change: "+12.5%", up: true, color: "from-emerald-500/20 to-emerald-600/10" },
    { label: "Total Users", value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, change: "+8.2%", up: true, color: "from-blue-500/20 to-blue-600/10" },
    { label: "Total Orders", value: (stats?.totalOrders || 0).toLocaleString(), icon: ShoppingCart, change: "+15.3%", up: true, color: "from-purple-500/20 to-purple-600/10" },
    { label: "Total Products", value: (stats?.totalProducts || 0).toLocaleString(), icon: Package, change: "+5.1%", up: true, color: "from-amber-500/20 to-amber-600/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-5" hover>
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color}`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-400">Orders</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Store size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stats?.pendingSellers || 0}</p>
              <p className="text-xs text-gray-500">Pending Seller Approvals</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <MessageSquare size={20} className="text-rose-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stats?.pendingReviews || 0}</p>
              <p className="text-xs text-gray-500">Pending Reviews</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{stats?.totalSellers || 0}</p>
              <p className="text-xs text-gray-500">Active Sellers</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data?.recentOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">${Number(order.total).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "delivered" ? "bg-emerald-500/10 text-emerald-400" :
                    order.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                    order.status === "cancelled" ? "bg-rose-500/10 text-rose-400" :
                    "bg-blue-500/10 text-blue-400"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

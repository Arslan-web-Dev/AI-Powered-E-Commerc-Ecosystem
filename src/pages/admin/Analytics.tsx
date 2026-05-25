import { motion } from "framer-motion";
import { BarChart3, Users, ShoppingCart, DollarSign } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function AdminAnalytics() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery();

  const salesData = data?.salesChartData?.map(d => ({ date: d.date.slice(5), revenue: Number(d.revenue), orders: d.orders })) || [];
  const userData = data?.userGrowthData?.map(d => ({ date: d.date.slice(5), users: d.count })) || [];

  const orderStatusData = [
    { name: "Pending", value: 12, color: "#f59e0b" },
    { name: "Processing", value: 8, color: "#3b82f6" },
    { name: "Shipped", value: 15, color: "#8b5cf6" },
    { name: "Delivered", value: 45, color: "#10b981" },
    { name: "Cancelled", value: 5, color: "#ef4444" },
  ];

  if (isLoading) {
    return <div className="space-y-6">{[...Array(3)].map((_, i) => <GlassCard key={i} className="animate-pulse h-72" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `$${(data?.stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
          { label: "Users", value: (data?.stats?.totalUsers || 0).toLocaleString(), icon: Users, color: "text-blue-400" },
          { label: "Orders", value: (data?.stats?.totalOrders || 0).toLocaleString(), icon: ShoppingCart, color: "text-purple-400" },
          { label: "Products", value: (data?.stats?.totalProducts || 0).toLocaleString(), icon: BarChart3, color: "text-amber-400" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-5" hover>
              <stat.icon size={20} className={stat.color} />
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs><linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                {orderStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {orderStatusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.name}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">User Growth</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={userData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
            <Tooltip contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
            <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

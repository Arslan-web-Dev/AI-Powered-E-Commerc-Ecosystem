import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SellerAnalytics() {
  const { data, isLoading } = trpc.seller.dashboard.useQuery();

  if (isLoading || !data) {
    return <div className="space-y-6">{[...Array(2)].map((_, i) => <GlassCard key={i} className="animate-pulse h-72" />)}</div>;
  }

  const chartData = data.salesChartData.map(d => ({ date: d.date.slice(5), amount: d.amount }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: `$${data.stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-400" },
          { label: "Orders", value: data.stats.totalOrders.toString(), icon: ShoppingCart, color: "text-purple-400" },
          { label: "Products", value: data.stats.totalProducts.toString(), icon: Package, color: "text-blue-400" },
          { label: "Pending", value: data.stats.pendingOrders.toString(), icon: TrendingUp, color: "text-amber-400" },
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

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Daily Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs><linearGradient id="sellGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
            <Tooltip contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
            <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#sellGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

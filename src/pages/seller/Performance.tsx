import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const salesData = [
  { month: "Jan", sales: 4200, target: 5000 },
  { month: "Feb", sales: 3800, target: 5000 },
  { month: "Mar", sales: 5100, target: 5000 },
  { month: "Apr", sales: 4600, target: 5500 },
  { month: "May", sales: 6200, target: 5500 },
  { month: "Jun", sales: 5800, target: 6000 },
];

const conversionData = [
  { day: "Mon", views: 120, purchases: 15 },
  { day: "Tue", views: 145, purchases: 22 },
  { day: "Wed", views: 180, purchases: 28 },
  { day: "Thu", views: 160, purchases: 20 },
  { day: "Fri", views: 200, purchases: 35 },
  { day: "Sat", views: 240, purchases: 42 },
  { day: "Sun", views: 210, purchases: 30 },
];

export default function SellerPerformance() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Performance Insights</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Conversion Rate", value: "14.2%", change: "+2.1%", up: true, icon: BarChart3 },
          { label: "Avg Order Value", value: "$87.50", change: "+5.3%", up: true, icon: DollarSign },
          { label: "Return Rate", value: "3.2%", change: "-1.5%", up: true, icon: TrendingDown },
          { label: "Product Views", value: "1,295", change: "+12%", up: true, icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-5" hover>
              <stat.icon size={20} className="text-cyan-400" />
              <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <span className={`text-xs ${stat.up ? "text-emerald-400" : "text-rose-400"}`}>{stat.change}</span>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sales vs Target</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Views vs Purchases</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={conversionData}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} />
              <Tooltip contentStyle={{ background: "rgba(12,16,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
              <Area type="monotone" dataKey="views" stroke="#06b6d4" strokeWidth={2} fill="url(#viewsGrad)" />
              <Area type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={2} fill="url(#purchaseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}

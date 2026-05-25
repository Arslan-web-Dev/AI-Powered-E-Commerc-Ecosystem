import { Link } from "react-router";
import { motion } from "framer-motion";
import { Bell, ShoppingBag, Tag, Info, Store, CheckCheck } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/ui-custom/GlassCard";

const typeConfig: Record<string, { icon: typeof Info; color: string }> = {
  order: { icon: ShoppingBag, color: "text-purple-400" },
  promotion: { icon: Tag, color: "text-amber-400" },
  system: { icon: Info, color: "text-blue-400" },
  seller: { icon: Store, color: "text-emerald-400" },
};

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.notification.list.useQuery(undefined, { enabled: isAuthenticated });
  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-12 text-center">
        <Bell size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-4">Login to view notifications</h2>
        <Link to="/login" className="px-6 py-2.5 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Login</Link>
      </GlassCard>
    );
  }

  if (isLoading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <GlassCard key={i} className="animate-pulse h-16" />)}</div>;
  }

  if (!data?.items.length) {
    return (
      <GlassCard className="p-12 text-center">
        <Bell size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white">No notifications</h2>
        <p className="text-gray-400 mt-2">We'll notify you when something happens.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications ({data.unreadCount} unread)</h1>
        {data.unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()} className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {data.items.map((notif, i) => {
        const config = typeConfig[notif.type] || typeConfig.system;
        const Icon = config.icon;
        return (
          <motion.div key={notif.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
            <GlassCard
              className={`p-4 cursor-pointer transition-colors ${!notif.isRead ? "border-purple-500/20 bg-purple-500/[0.02]" : ""}`}
              onClick={() => { if (!notif.isRead) markRead.mutate({ id: notif.id }); }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.05]`}>
                  <Icon size={16} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${!notif.isRead ? "font-semibold text-white" : "font-medium text-gray-300"}`}>{notif.title}</h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                  <p className="text-[10px] text-gray-600 mt-2">
                    {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}

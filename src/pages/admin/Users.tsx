import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { GlassCard } from "@/components/ui-custom/GlassCard";

const roleColors: Record<string, string> = {
  admin: "bg-purple-500/15 text-purple-400",
  seller: "bg-emerald-500/15 text-emerald-400",
  user: "bg-blue-500/15 text-blue-400",
};

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");

  const { data } = trpc.admin.users.useQuery({ page, limit: 20, search: search || undefined, role: role as any });
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => window.location.reload(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">User Management</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..." className="input-dark pl-9 w-full" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input-dark">
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-8 h-8 rounded-full" />
                      <span className="text-white font-medium">{user.name || "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || roleColors.user}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value as any })}
                      className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="user">User</option>
                      <option value="seller">Seller</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-gray-500">Page {data.page} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-gray-400 hover:text-white disabled:opacity-30">Previous</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-gray-400 hover:text-white disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

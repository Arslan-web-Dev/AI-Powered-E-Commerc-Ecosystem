import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Package, ShoppingBag, MessageSquare,
  Image, Tag, Settings, ChevronLeft, ChevronRight, LogOut, Store, BarChart3
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const adminNavItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Sellers", path: "/admin/sellers", icon: Store },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { label: "Reviews", path: "/admin/reviews", icon: MessageSquare },
  { label: "Banners", path: "/admin/banners", icon: Image },
  { label: "Coupons", path: "/admin/coupons", icon: Tag },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full border-r border-white/[0.06] z-40 transition-all duration-300 flex flex-col"
        style={{
          width: collapsed ? "72px" : "260px",
          background: "rgba(10,14,26,0.98)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <BarChart3 size={18} className="text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold gradient-text">Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-purple-500/15 text-purple-400 border-r-2 border-purple-400"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] transition-colors w-full"
          >
            <ChevronLeft size={18} className="flex-shrink-0" />
            {!collapsed && <span>Back to Store</span>}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors w-full"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-white/[0.1] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
          style={{ background: "rgba(15,20,35,1)" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? "72px" : "260px" }}
      >
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

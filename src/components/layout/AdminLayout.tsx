import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Package, ShoppingBag, MessageSquare,
  Image, Tag, Settings, ChevronLeft, ChevronRight, LogOut, Store, BarChart3
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { label: "Dashboard", path: "/admin",           icon: LayoutDashboard },
  { label: "Analytics",  path: "/admin/analytics", icon: BarChart3 },
  { label: "Users",      path: "/admin/users",     icon: Users },
  { label: "Sellers",    path: "/admin/sellers",   icon: Store },
  { label: "Products",   path: "/admin/products",  icon: Package },
  { label: "Orders",     path: "/admin/orders",    icon: ShoppingBag },
  { label: "Reviews",    path: "/admin/reviews",   icon: MessageSquare },
  { label: "Banners",    path: "/admin/banners",   icon: Image },
  { label: "Coupons",    path: "/admin/coupons",   icon: Tag },
  { label: "Settings",   path: "/admin/settings",  icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className="flex min-h-screen">
      <aside
        className="fixed left-0 top-0 h-full border-r border-white/[0.06] z-40 flex flex-col transition-[width] duration-250"
        style={{ width: sidebarWidth, background: "rgba(8,12,24,0.98)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <BarChart3 size={16} className="text-white" />
          </div>
          {!collapsed && <span className="text-[15px] font-bold brand-text truncate">Admin</span>}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`nav-item ${active ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
              >
                <item.icon size={17} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-white/[0.06] space-y-0.5">
          <button
            onClick={() => navigate("/")}
            className={`nav-item w-full ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Back to store" : undefined}
          >
            <ChevronLeft size={17} className="shrink-0" />
            {!collapsed && <span>Back to store</span>}
          </button>
          <button
            onClick={logout}
            className={`nav-item w-full text-rose-400 hover:text-rose-300 hover:!bg-rose-500/10 ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`nav-item w-full ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      <main
        className="flex-1 min-h-screen transition-[margin] duration-250"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="p-6 max-w-screen-xl">{children}</div>
      </main>
    </div>
  );
}

import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, Settings,
  Sparkles, ChevronLeft, LogOut, PlusCircle, TrendingUp, Store
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { label: "Dashboard",   path: "/seller",              icon: LayoutDashboard },
  { label: "Products",    path: "/seller/products",     icon: Package },
  { label: "Add product", path: "/seller/products/new", icon: PlusCircle },
  { label: "Orders",      path: "/seller/orders",       icon: ShoppingBag },
  { label: "Analytics",   path: "/seller/analytics",    icon: BarChart3 },
  { label: "AI Tools",    path: "/seller/ai-tools",     icon: Sparkles },
  { label: "Performance", path: "/seller/performance",  icon: TrendingUp },
  { label: "Settings",    path: "/seller/settings",     icon: Settings },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside
        className="fixed left-0 top-0 h-full border-r border-white/[0.06] z-40 flex flex-col w-60"
        style={{ background: "rgba(8,12,24,0.98)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            <Store size={16} className="text-white" />
          </div>
          <span
            className="text-[15px] font-bold truncate"
            style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Seller Hub
          </span>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${pathname === item.path ? "active" : ""}`}
              style={pathname === item.path ? { borderRightColor: "#34d399", color: "#34d399", background: "rgba(16,185,129,0.1)" } : {}}
            >
              <item.icon size={17} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-white/[0.06] space-y-0.5">
          <button onClick={() => navigate("/")} className="nav-item w-full">
            <ChevronLeft size={17} /> Back to store
          </button>
          <button onClick={logout} className="nav-item w-full text-rose-400 hover:text-rose-300 hover:!bg-rose-500/10">
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen ml-60">
        <div className="p-6 max-w-screen-xl">{children}</div>
      </main>
    </div>
  );
}

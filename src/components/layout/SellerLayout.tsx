import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, Settings,
  Sparkles, ChevronLeft, LogOut, PlusCircle, TrendingUp
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const sellerNavItems = [
  { label: "Dashboard", path: "/seller", icon: LayoutDashboard },
  { label: "My Products", path: "/seller/products", icon: Package },
  { label: "Add Product", path: "/seller/products/new", icon: PlusCircle },
  { label: "Orders", path: "/seller/orders", icon: ShoppingBag },
  { label: "Analytics", path: "/seller/analytics", icon: BarChart3 },
  { label: "AI Tools", path: "/seller/ai-tools", icon: Sparkles },
  { label: "Performance", path: "/seller/performance", icon: TrendingUp },
  { label: "Settings", path: "/seller/settings", icon: Settings },
];

export function SellerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed] = useState(false);
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
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
            <Store size={18} className="text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold" style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Seller</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sellerNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-emerald-500/15 text-emerald-400 border-r-2 border-emerald-400"
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

function Store(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

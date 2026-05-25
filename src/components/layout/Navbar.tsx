import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingCart, Search, User, Menu, X, LogOut, Heart,
  Bell, Package, Shield, Store, Zap, ChevronDown, Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Categories", path: "/categories" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: cartData } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifData } = trpc.notification.list.useQuery(undefined, { enabled: isAuthenticated });

  const cartCount = cartData?.items?.reduce((s, i) => s + (i?.quantity || 0), 0) || 0;
  const unreadCount = notifData?.unreadCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
      setQuery("");
    }
  };

  return (
    <nav
      className="sticky top-0 z-40 border-b border-white/[0.05]"
      style={{ background: "rgba(8,12,24,0.88)", backdropFilter: "blur(18px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15 gap-4" style={{ height: "60px" }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-bold brand-text hidden sm:block">NexusAI</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[420px]">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands…"
                className="field pl-9 py-2 text-[13px]"
              />
            </div>
          </form>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  pathname === l.path
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-white/50 hover:text-white/85 hover:bg-white/[0.04]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <button
                onClick={() => navigate("/wishlist")}
                className="p-2 rounded-lg text-white/45 hover:text-white/85 hover:bg-white/[0.05] transition-colors"
              >
                <Heart size={18} />
              </button>
            )}

            <button
              onClick={() => navigate("/cart")}
              className="p-2 rounded-lg text-white/45 hover:text-white/85 hover:bg-white/[0.05] transition-colors relative"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 text-[10px] text-white flex items-center justify-center font-bold leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => navigate("/notifications")}
                className="p-2 rounded-lg text-white/45 hover:text-white/85 hover:bg-white/[0.05] transition-colors relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative group ml-1">
                <button className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                    alt={user?.name || "User"}
                    className="w-7 h-7 rounded-full border border-indigo-500/25"
                  />
                  <ChevronDown size={12} className="text-white/30" />
                </button>

                <div
                  className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-white/[0.08] shadow-xl shadow-black/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150"
                  style={{ background: "rgba(10,14,26,0.98)", backdropFilter: "blur(20px)" }}
                >
                  <div className="p-3 border-b border-white/[0.06]">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-white/35 mt-0.5">{user?.email}</p>
                    {user?.role && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-400">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="p-1.5">
                    {[
                      { path: "/profile", icon: User, label: "Profile" },
                      { path: "/orders", icon: Package, label: "My Orders" },
                    ].map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/60 hover:text-white/90 hover:bg-white/[0.04] transition-colors"
                      >
                        <item.icon size={14} />
                        {item.label}
                      </Link>
                    ))}
                    {user?.role === "seller" && (
                      <Link to="/seller" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/60 hover:text-white/90 hover:bg-white/[0.04] transition-colors">
                        <Store size={14} /> Seller Hub
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/60 hover:text-white/90 hover:bg-white/[0.04] transition-colors">
                        <Shield size={14} /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-white/[0.05] mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors w-full"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary ml-1 py-1.5 text-[13px]">
                Sign in
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-white/45 hover:text-white/85 hover:bg-white/[0.05] transition-colors ml-1"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/[0.05] overflow-hidden"
            style={{ background: "rgba(8,12,24,0.96)" }}
          >
            <div className="px-4 py-4 space-y-1">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="field pl-9 py-2.5 text-sm"
                  />
                </div>
              </form>
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === l.path
                      ? "text-indigo-400 bg-indigo-500/10"
                      : "text-white/50 hover:text-white/85 hover:bg-white/[0.04]"
                  }`}
                >
                  <Home size={15} />
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

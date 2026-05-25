import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, User, Menu, X, LogOut, Heart,
  Bell, Package, Shield, Store, Sparkles, ChevronDown, Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: cartData } = trpc.cart.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: notifData } = trpc.notification.list.useQuery(undefined, { enabled: isAuthenticated });

  const cartCount = cartData?.items?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;
  const notifCount = notifData?.unreadCount || 0;

  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Products", path: "/products", icon: Package },
    { label: "Categories", path: "/categories", icon: Sparkles },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ background: "rgba(10,14,26,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">NexusAI</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40 transition-colors"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Wishlist */}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/wishlist")}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors relative"
              >
                <Heart size={20} />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] text-white flex items-center justify-center font-bold min-w-[18px]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/notifications")}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors relative"
              >
                <Bell size={20} />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold min-w-[18px]">
                    {notifCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                  <img
                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user?.name}
                    alt={user?.name || "User"}
                    className="w-7 h-7 rounded-full border border-purple-500/30"
                  />
                  <ChevronDown size={14} className="text-gray-500" />
                </button>

                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.08] shadow-xl shadow-purple-500/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  style={{ background: "rgba(12,16,30,0.98)", backdropFilter: "blur(20px)" }}
                >
                  <div className="p-3 border-b border-white/[0.06]">
                    <p className="text-sm font-medium text-white">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{user?.email || ""}</p>
                    {user?.role && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-400">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                      <User size={15} /> Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                      <Package size={15} /> My Orders
                    </Link>
                    {isSeller && (
                      <Link to="/seller" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                        <Store size={15} /> Seller Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors">
                        <Shield size={15} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors w-full"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-white/[0.06] overflow-hidden"
            style={{ background: "rgba(10,14,26,0.95)", backdropFilter: "blur(20px)" }}
          >
            <div className="px-4 py-4 space-y-1">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-purple-400 bg-purple-500/10"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

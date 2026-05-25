import { Routes, Route, Navigate } from "react-router";
import { Navbar } from "@/components/layout/Navbar";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { SellerLayout } from "@/components/layout/SellerLayout";
import { AIChatbot } from "@/components/ui-custom/AIChatbot";
import { useAuth } from "@/hooks/useAuth";

// Customer pages
import Home from "@/pages/customer/Home";
import Products from "@/pages/customer/Products";
import ProductDetail from "@/pages/customer/ProductDetail";
import Cart from "@/pages/customer/Cart";
import Checkout from "@/pages/customer/Checkout";
import Orders from "@/pages/customer/Orders";
import Profile from "@/pages/customer/Profile";
import Wishlist from "@/pages/customer/Wishlist";
import Notifications from "@/pages/customer/Notifications";
import Categories from "@/pages/customer/Categories";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminSellers from "@/pages/admin/Sellers";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminReviews from "@/pages/admin/Reviews";
import AdminBanners from "@/pages/admin/Banners";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminSettings from "@/pages/admin/Settings";

// Seller pages
import SellerDashboard from "@/pages/seller/Dashboard";
import SellerProducts from "@/pages/seller/Products";
import SellerAddProduct from "@/pages/seller/AddProduct";
import SellerOrders from "@/pages/seller/Orders";
import SellerAnalytics from "@/pages/seller/Analytics";
import SellerAITools from "@/pages/seller/AITools";
import SellerPerformance from "@/pages/seller/Performance";
import SellerSettings from "@/pages/seller/Settings";
import SellerRegister from "@/pages/seller/SellerRegister";

// Auth pages
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-[#0a0e1a]" />;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function SellerGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-[#0a0e1a]" />;
  if (!user || (user.role !== "seller" && user.role !== "admin")) return <Navigate to="/seller/register" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Routes>
        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/analytics" element={<AdminAnalytics />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/sellers" element={<AdminSellers />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/orders" element={<AdminOrders />} />
                  <Route path="/reviews" element={<AdminReviews />} />
                  <Route path="/banners" element={<AdminBanners />} />
                  <Route path="/coupons" element={<AdminCoupons />} />
                  <Route path="/settings" element={<AdminSettings />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminLayout>
            </AdminGuard>
          }
        />

        {/* Seller routes */}
        <Route
          path="/seller/*"
          element={
            <SellerGuard>
              <SellerLayout>
                <Routes>
                  <Route path="/" element={<SellerDashboard />} />
                  <Route path="/products" element={<SellerProducts />} />
                  <Route path="/products/new" element={<SellerAddProduct />} />
                  <Route path="/orders" element={<SellerOrders />} />
                  <Route path="/analytics" element={<SellerAnalytics />} />
                  <Route path="/ai-tools" element={<SellerAITools />} />
                  <Route path="/performance" element={<SellerPerformance />} />
                  <Route path="/settings" element={<SellerSettings />} />
                  <Route path="*" element={<Navigate to="/seller" replace />} />
                </Routes>
              </SellerLayout>
            </SellerGuard>
          }
        />

        {/* Public routes with navbar */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/seller/register" element={<SellerRegister />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <AIChatbot />
            </>
          }
        />
      </Routes>
    </div>
  );
}

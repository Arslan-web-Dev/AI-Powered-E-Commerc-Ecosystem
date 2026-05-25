import { ShoppingCart } from "lucide-react";
import { GlassCard } from "@/components/ui-custom/GlassCard";

export default function SellerOrders() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      <GlassCard className="p-12 text-center">
        <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Order Management</h2>
        <p className="text-gray-400">View and manage customer orders for your products.</p>
        <p className="text-sm text-gray-600 mt-2">This feature integrates with the admin order system to show only your seller orders.</p>
      </GlassCard>
    </div>
  );
}

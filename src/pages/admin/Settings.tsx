import { motion } from "framer-motion";
import { Settings, Shield, Save } from "lucide-react";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { useState } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "NexusAI Commerce",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveReviews: false,
    commissionRate: 10,
    freeShippingThreshold: 100,
    taxRate: 8,
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Platform Settings</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Settings size={18} className="text-purple-400" /> General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Site Name</label>
              <input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="input-dark" />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Put site in maintenance mode</p>
              </div>
              <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-11 h-6 rounded-full transition-colors ${settings.maintenanceMode ? "bg-purple-500" : "bg-gray-700"}`}>
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${settings.maintenanceMode ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white">Allow Registration</p>
                <p className="text-xs text-gray-500">New users can sign up</p>
              </div>
              <button onClick={() => setSettings({...settings, allowRegistration: !settings.allowRegistration})} className={`w-11 h-6 rounded-full transition-colors ${settings.allowRegistration ? "bg-purple-500" : "bg-gray-700"}`}>
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${settings.allowRegistration ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Shield size={18} className="text-purple-400" /> Commerce</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Commission Rate (%)</label>
                <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Free Shipping ($)</label>
                <input type="number" value={settings.freeShippingThreshold} onChange={e => setSettings({...settings, freeShippingThreshold: Number(e.target.value)})} className="input-dark" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: Number(e.target.value)})} className="input-dark" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white">Auto-Approve Reviews</p>
                <p className="text-xs text-gray-500">Skip manual review moderation</p>
              </div>
              <button onClick={() => setSettings({...settings, autoApproveReviews: !settings.autoApproveReviews})} className={`w-11 h-6 rounded-full transition-colors ${settings.autoApproveReviews ? "bg-purple-500" : "bg-gray-700"}`}>
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${settings.autoApproveReviews ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Save size={18} /> Save Settings
        </button>
      </motion.div>
    </div>
  );
}

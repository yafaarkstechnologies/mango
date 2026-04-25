"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Save, 
  Truck, 
  Globe, 
  ShieldCheck,
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getAdminSettingsAction, updateAdminSettingAction } from "@/app/actions/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const result = await getAdminSettingsAction();
    if (result.success) setSettings(result.data || []);
    setLoading(false);
  }

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key);
    const result = await updateAdminSettingAction(key, value);
    if (result.success) {
      // Success feedback could be more elegant
    }
    setSaving(null);
  };

  const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value || "";

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-500 font-medium mt-1">Configure global platform behavior and business rules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping & Delivery */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 lg:p-10 space-y-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Shipping & Delivery</h2>
              <p className="text-zinc-500 text-xs font-medium">Manage rates and fulfillment settings.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Flat Shipping Rate (₹)</label>
              <div className="flex gap-3">
                <input 
                  type="number"
                  defaultValue={getSettingValue("shipping_rate")}
                  onBlur={(e) => handleUpdate("shipping_rate", e.target.value)}
                  className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
                />
                <button className="bg-white/5 p-4 rounded-2xl text-zinc-400 hover:text-white transition-all">
                  <Save size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
               <AlertCircle className="text-blue-500 shrink-0" size={20} />
               <p className="text-blue-200/70 text-xs leading-relaxed">
                 Setting shipping to 0 will enable "Free Shipping" sitewide. Changes take effect immediately for new orders.
               </p>
            </div>
          </div>
        </motion.div>

        {/* Store Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 lg:p-10 space-y-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Platform Config</h2>
              <p className="text-zinc-500 text-xs font-medium">General store settings and visibility.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Harvest Year Display</label>
              <input 
                type="text"
                placeholder="2026"
                defaultValue={getSettingValue("harvest_year")}
                onBlur={(e) => handleUpdate("harvest_year", e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
               <div className="flex items-center gap-3">
                  <ShieldCheck className={cn(getSettingValue("maintenance_mode") === "true" ? "text-red-500" : "text-green-500")} size={20} />
                  <div>
                    <p className="text-white text-sm font-bold">Maintenance Mode</p>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                      Store is currently {getSettingValue("maintenance_mode") === "true" ? "MAINTENANCE" : "LIVE"}
                    </p>
                  </div>
               </div>
               <div 
                 onClick={() => handleUpdate("maintenance_mode", getSettingValue("maintenance_mode") === "true" ? "false" : "true")}
                 className={cn(
                   "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                   getSettingValue("maintenance_mode") === "true" ? "bg-red-500/20 border-red-500/30" : "bg-green-500/20 border-green-500/30"
                 )}
               >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full transition-all duration-300",
                    getSettingValue("maintenance_mode") === "true" ? "left-7 bg-red-500" : "left-1 bg-green-500"
                  )} />
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

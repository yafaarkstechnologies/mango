"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Ticket, 
  Trash2, 
  Pause, 
  Play, 
  Users, 
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getCouponsAction, toggleCouponStatusAction, deleteCouponAction, createCouponAction } from "@/app/actions/coupons";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: 0,
    usage_limit: null as number | null,
    influencer_name: "",
    is_active: true,
    is_paused: false
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    const result = await getCouponsAction();
    if (result.success) setCoupons(result.data || []);
    setLoading(false);
  }

  const handleToggle = async (id: string, field: any, current: boolean) => {
    const result = await toggleCouponStatusAction(id, field, current);
    if (result.success) fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this coupon?")) {
      const result = await deleteCouponAction(id);
      if (result.success) fetchCoupons();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createCouponAction({
      ...newCoupon,
      code: newCoupon.code.toUpperCase()
    });
    if (result.success) {
      setIsAddModalOpen(false);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_amount: 0,
        usage_limit: null,
        influencer_name: "",
        is_active: true,
        is_paused: false
      });
      fetchCoupons();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.influencer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Coupons</h1>
          <p className="text-zinc-500 font-medium mt-1">Manage discounts and influencer tracking.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-48 bg-zinc-900/40 rounded-[2rem] animate-pulse border border-white/5" />)
        ) : filteredCoupons.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500 bg-zinc-900/40 rounded-[2rem] border border-white/5">
            No coupons active.
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <motion.div 
              layout
              key={coupon.id}
              className={cn(
                "bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-6 relative group overflow-hidden transition-all",
                coupon.is_paused && "grayscale opacity-60"
              )}
            >
              {/* Left Side: Code & Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                      <Ticket size={24} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white tracking-widest uppercase">{coupon.code}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                        <span className="mx-1">•</span>
                        Min. ₹{coupon.min_order_amount}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Usage</span>
                    <span className="text-white font-bold">{coupon.used_count || 0} / {coupon.usage_limit || "∞"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Influencer</span>
                    <span className="text-white font-bold">{coupon.influencer_name || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex md:flex-col items-center justify-center gap-3">
                <button 
                  onClick={() => handleToggle(coupon.id, "is_paused", coupon.is_paused)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border",
                    coupon.is_paused 
                      ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" 
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                  )}
                >
                  {coupon.is_paused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <button 
                  onClick={() => handleDelete(coupon.id)}
                  className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Status Ribbon */}
              <div className={cn(
                "absolute top-0 right-0 px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest -rotate-0 rounded-bl-2xl border-l border-b border-white/5",
                coupon.is_paused ? "bg-zinc-800 text-zinc-500" : "bg-orange-500/20 text-orange-500"
              )}>
                {coupon.is_paused ? "Paused" : "Active"}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Coupon Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Create Coupon</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><XCircle size={24} /></button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Coupon Code</label>
                  <input 
                    required
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none uppercase font-black tracking-widest" 
                    placeholder="MANGO20" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Discount Type</label>
                    <select 
                      value={newCoupon.discount_type}
                      onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none font-bold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Value</label>
                    <input 
                      type="number"
                      required
                      value={newCoupon.discount_value}
                      onChange={(e) => setNewCoupon({...newCoupon, discount_value: parseFloat(e.target.value)})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none font-bold" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Min. Order (₹)</label>
                    <input 
                      type="number"
                      value={newCoupon.min_order_amount}
                      onChange={(e) => setNewCoupon({...newCoupon, min_order_amount: parseFloat(e.target.value)})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Usage Limit</label>
                    <input 
                      type="number"
                      value={newCoupon.usage_limit || ""}
                      onChange={(e) => setNewCoupon({...newCoupon, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Influencer Name (Optional)</label>
                  <input 
                    value={newCoupon.influencer_name}
                    onChange={(e) => setNewCoupon({...newCoupon, influencer_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                    placeholder="e.g. John Doe"
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-5 rounded-[2rem] shadow-2xl transition-all active:scale-95 uppercase tracking-widest mt-4"
                >
                  {isSubmitting ? "Creating..." : "Generate Coupon"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

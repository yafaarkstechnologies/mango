"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  ShoppingBag,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrdersAction, updateOrderAction, deleteOrderAction, createManualOrderAction } from "@/app/actions/orders";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "@/lib/supabase";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    flat_no: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip: "",
    total_amount: 0,
    status: "paid",
    batch_id: "",
    coupon_id: "",
    discount_amount: 0
  });
  const [orderItems, setOrderItems] = useState<any[]>([{ product_id: "", quantity: 1, unit_price: 0 }]);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCouponsAndBatches();
  }, []);

  async function fetchCouponsAndBatches() {
    const [cResult, bResult] = await Promise.all([
      supabase.from("coupons").select("*").eq("is_active", true),
      supabase.from("batches").select("*").eq("is_active", true)
    ]);
    if (cResult.data) setCoupons(cResult.data);
    if (bResult.data) setBatches(bResult.data);
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*");
    if (data) setProducts(data);
  }

  async function fetchOrders() {
    setLoading(true);
    const result = await getOrdersAction();
    if (result.success) setOrders(result.data || []);
    setLoading(false);
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    const result = await updateOrderAction(selectedOrder.id, { status });
    if (result.success) {
      await fetchOrders();
      setIsEditModalOpen(false);
    }
    setUpdating(false);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Calculate subtotal
    const subtotal = orderItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    
    // Calculate discount if coupon selected
    let discount = 0;
    const selectedCoupon = coupons.find(c => c.id === newOrder.coupon_id);
    if (selectedCoupon) {
      if (selectedCoupon.discount_type === "percentage") {
        discount = (subtotal * selectedCoupon.discount_value) / 100;
      } else {
        discount = selectedCoupon.discount_value;
      }
    }

    const finalTotal = Math.max(0, subtotal - discount);
    
    const result = await createManualOrderAction({ 
      ...newOrder, 
      total_amount: finalTotal,
      discount_amount: discount
    }, orderItems);
    if (result.success) {
      setIsAddModalOpen(false);
      setNewOrder({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        flat_no: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        zip: "",
        total_amount: 0,
        status: "paid",
        batch_id: "",
        coupon_id: "",
        discount_amount: 0
      });
      setOrderItems([{ product_id: "", quantity: 1, unit_price: 0 }]);
      await fetchOrders();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this order?")) {
      const result = await deleteOrderAction(id);
      if (result.success) fetchOrders();
    }
  };

  const filteredOrders = orders.filter(order => 
    order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "shipped": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
          <p className="text-zinc-500 font-medium mt-1">Total {orders.length} orders processed.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Manual Order
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search customer, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
          />
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-900 border border-white/5 px-6 py-3.5 rounded-2xl text-zinc-400 hover:text-white transition-all font-bold text-sm">
          <Download size={18} />
          Export All Data
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Order Details</th>
                <th className="px-6 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Customer Info</th>
                <th className="px-6 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Status</th>
                <th className="px-6 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-right">Revenue</th>
                <th className="px-8 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="h-24 animate-pulse bg-white/[0.02]" />)
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-white/[0.02] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-sm tracking-widest uppercase">#{order.id.slice(0, 8)}</span>
                      <span className="text-zinc-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                        <Clock size={12} className="text-orange-500/50" />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {order.customer_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">{order.customer_name}</span>
                        <span className="text-zinc-500 text-xs mt-0.5">{order.customer_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                      getStatusColor(order.status)
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <span className="text-white font-black text-sm">₹{order.total_amount?.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsEditModalOpen(true); }}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 transition-all shadow-xl"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all shadow-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Update Order</h2>
                    <p className="text-zinc-500 text-xs font-bold mt-1 uppercase tracking-widest">Order ID: #{selectedOrder.id.slice(0, 8)}</p>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Order Lifecycle Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={updating}
                          className={cn(
                            "py-4 px-6 rounded-[1.5rem] border font-black text-[10px] uppercase tracking-widest transition-all text-center",
                            selectedOrder.status === status 
                              ? "bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-500/20" 
                              : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:border-white/10"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 flex gap-4">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <div>
                      <p className="text-orange-100 text-xs font-bold leading-relaxed mb-1 uppercase tracking-wide">Automatic Notifications</p>
                      <p className="text-orange-100/60 text-[10px] leading-relaxed font-medium">
                        Changing status to "Shipped" or "Delivered" will automatically trigger an email notification to {selectedOrder.customer_email}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Add Manual Order Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleCreateOrder} className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">New Manual Order</h2>
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Customer Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Customer Name</label>
                      <input 
                        required
                        value={newOrder.customer_name}
                        onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Email</label>
                      <input 
                        required
                        type="email"
                        value={newOrder.customer_email}
                        onChange={(e) => setNewOrder({...newOrder, customer_email: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Phone Number</label>
                    <input 
                      required
                      type="tel"
                      value={newOrder.customer_phone}
                      onChange={(e) => setNewOrder({...newOrder, customer_phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Shipping Address</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Flat / House No</label>
                      <input 
                        required
                        value={newOrder.flat_no}
                        onChange={(e) => setNewOrder({...newOrder, flat_no: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Address Line 1</label>
                      <input 
                        required
                        value={newOrder.address_line_1}
                        onChange={(e) => setNewOrder({...newOrder, address_line_1: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Address Line 2 (Optional)</label>
                    <input 
                      value={newOrder.address_line_2}
                      onChange={(e) => setNewOrder({...newOrder, address_line_2: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">City</label>
                      <input 
                        required
                        value={newOrder.city}
                        onChange={(e) => setNewOrder({...newOrder, city: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">State</label>
                      <input 
                        required
                        value={newOrder.state}
                        onChange={(e) => setNewOrder({...newOrder, state: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">ZIP / Postal Code</label>
                      <input 
                        required
                        value={newOrder.zip}
                        onChange={(e) => setNewOrder({...newOrder, zip: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Fulfillment & Discounts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Inventory Batch</label>
                      <select 
                        value={newOrder.batch_id}
                        onChange={(e) => setNewOrder({...newOrder, batch_id: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      >
                        <option value="">No Specific Batch</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.batch_name} (Stock: {b.current_stock})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Apply Coupon</label>
                      <select 
                        value={newOrder.coupon_id}
                        onChange={(e) => setNewOrder({...newOrder, coupon_id: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none"
                      >
                        <option value="">No Coupon</option>
                        {coupons.map(c => (
                          <option key={c.id} value={c.id}>{c.code} ({c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`} off)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Order Items</h3>
                  {orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="col-span-6 space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product</label>
                        <select 
                          required
                          value={item.product_id}
                          onChange={(e) => {
                            const p = products.find(p => p.id === e.target.value);
                            const updated = [...orderItems];
                            updated[index] = { ...item, product_id: e.target.value, unit_price: p?.price || 0 };
                            setOrderItems(updated);
                          }}
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 text-white outline-none"
                        >
                          <option value="">Select Product</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                        </select>
                      </div>
                      <div className="col-span-3 space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Qty</label>
                        <input 
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...orderItems];
                            updated[index].quantity = parseInt(e.target.value);
                            setOrderItems(updated);
                          }}
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 text-white outline-none"
                        />
                      </div>
                      <div className="col-span-2 text-right self-center pt-4">
                        <span className="text-white font-bold text-sm">₹{item.unit_price * item.quantity}</span>
                      </div>
                      <div className="col-span-1">
                        <button 
                          type="button"
                          onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))}
                          className="p-2 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setOrderItems([...orderItems, { product_id: "", quantity: 1, unit_price: 0 }])}
                    className="text-orange-500 text-xs font-bold uppercase tracking-widest hover:text-orange-400 flex items-center gap-2 px-1"
                  >
                    <Plus size={14} /> Add Another Item
                  </button>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between items-center text-zinc-500 text-sm">
                      <span>Subtotal</span>
                      <span>₹{orderItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    {newOrder.coupon_id && (
                      <div className="flex justify-between items-center text-green-500 text-sm">
                        <span>Discount</span>
                        <span>- ₹{(() => {
                          const subtotal = orderItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
                          const coupon = coupons.find(c => c.id === newOrder.coupon_id);
                          if (!coupon) return 0;
                          return coupon.discount_type === "percentage" 
                            ? (subtotal * coupon.discount_value) / 100 
                            : coupon.discount_value;
                        })().toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest">Final Total</span>
                      <span className="text-3xl font-black text-white">₹{(() => {
                        const subtotal = orderItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
                        const coupon = coupons.find(c => c.id === newOrder.coupon_id);
                        const discount = coupon ? (coupon.discount_type === "percentage" ? (subtotal * coupon.discount_value) / 100 : coupon.discount_value) : 0;
                        return Math.max(0, subtotal - discount);
                      })().toLocaleString()}</span>
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-5 rounded-[2rem] shadow-2xl transition-all active:scale-95 uppercase tracking-widest"
                  >
                    {isSubmitting ? "Processing..." : "Create Order & Deduct Stock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

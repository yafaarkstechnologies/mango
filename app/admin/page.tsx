"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Batch {
  id: string;
  name: string;
  status: string;
  max_capacity: number;
  created_at: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  payment_id: string;
  status: string;
  batch_id?: string;
  order_items: OrderItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "batches" | "settings">("orders");
  const [newBatchName, setNewBatchName] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editName, setEditName] = useState("");
  
  // Settings state
  const [shippingRate, setShippingRate] = useState<string>("45");
  const [isSavingSettings, setIsSavingSettings] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    
    // Fetch Orders
    const { data: oData, error: oError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (oError) console.error("Error fetching orders:", oError);
    else setOrders(oData || []);

    // Fetch Batches
    const { data: bData, error: bError } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (bError) console.error("Error fetching batches:", bError);
    else setBatches(bData || []);

    // Fetch Settings
    const { data: sData, error: sError } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', 'shipping_rate')
      .single();
    
    if (sData) setShippingRate(sData.value);

    setIsLoading(false);
  }

  const saveSettings = async () => {
    setIsSavingSettings(true);
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key: 'shipping_rate', value: String(shippingRate) }, { onConflict: 'key' });

    if (error) {
      alert(`Error saving settings: ${error.message}`);
    } else {
      alert("Settings saved successfully!");
    }
    setIsSavingSettings(false);
  };

  const createBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName) return;

    const { error } = await supabase
      .from('batches')
      .insert([{ name: newBatchName, status: 'active' }]);

    if (error) {
      console.error("Batch creation error:", error);
      alert(`Error creating batch: ${error.message} (${error.code})`);
    } else {
      setNewBatchName("");
      fetchData();
    }

  };

  const closeBatch = async (id: string) => {
    const { error } = await supabase
      .from('batches')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) alert("Error closing batch");
    else fetchData();
  };

  const updateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !editName) return;

    const { error } = await supabase
      .from('batches')
      .update({ name: editName })
      .eq('id', editingBatch.id);

    if (error) alert("Error updating batch");
    else {
      setEditingBatch(null);
      fetchData();
    }
  };

  const deleteBatch = async (id: string) => {
    if (!confirm("Are you sure? This will not delete the orders, but they will no longer be associated with this batch.")) return;

    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) alert("Error deleting batch: " + error.message);
    else fetchData();
  };

  const reassignOrder = async (orderId: string, batchId: string | null) => {
    const { error } = await supabase
      .from('orders')
      .update({ batch_id: batchId })
      .eq('id', orderId);

    if (error) alert("Error reassigning order");
    else {
      // Update local state for immediate feedback
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, batch_id: batchId || undefined });
      }
      fetchData();
    }
  };

  const filteredOrders = batchFilter === 'all' 
    ? orders 
    : orders.filter(o => o.batch_id === batchFilter);


  return (
    <main className="min-h-screen bg-[#021a02] text-white font-sans selection:bg-yellow-500/30 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto pt-40 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs uppercase tracking-widest text-yellow-500/80 font-semibold">Admin Control</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              {activeTab === 'orders' ? 'Order Dashboard' : 'Batch Manager'}
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'orders' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-900/20' : 'text-white/40 hover:text-white'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('batches')}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'batches' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-900/20' : 'text-white/40 hover:text-white'}`}
            >
              Batches
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'settings' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-900/20' : 'text-white/40 hover:text-white'}`}
            >
              Settings
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse w-full border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="wait">
                {activeTab === 'orders' ? (
                  <motion.div
                    key="orders-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Filter Bar */}
                    <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold whitespace-nowrap">Filter by Batch:</span>
                      <button 
                        onClick={() => setBatchFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all transition-colors duration-300 ${batchFilter === 'all' ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                      >
                        All Orders
                      </button>
                      {batches.map(batch => (
                        <button 
                          key={batch.id}
                          onClick={() => setBatchFilter(batch.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all transition-colors duration-300 whitespace-nowrap ${batchFilter === batch.id ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        >
                          {batch.name}
                        </button>
                      ))}
                    </div>

                    {filteredOrders.length === 0 ? (
                      <div className="py-20 text-center rounded-3xl border border-dashed border-white/10 text-white/20 italic">
                        No orders found for this selection.
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          layoutId={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                            selectedOrder?.id === order.id 
                              ? 'bg-yellow-500/10 border-yellow-500/30' 
                              : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/1'
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs text-white/30 uppercase tracking-tighter">
                              {new Date(order.created_at).toLocaleDateString()}
                              {order.batch_id && <span className="ml-2 text-yellow-500/50">Batch: {batches.find(b => b.id === order.batch_id)?.name || 'Unknown'}</span>}
                            </span>
                            <h3 className="text-xl font-bold">{order.customer_name}</h3>
                            <span className="text-white/40 text-sm truncate max-w-[200px]">{order.customer_email}</span>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="flex flex-col items-end">
                              <span className="text-xs uppercase tracking-widest text-white/20 font-bold">Total</span>
                              <span className="text-xl font-mono text-yellow-500/90">₹{Number(order.total_amount).toFixed(2)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                ) : activeTab === 'batches' ? (
                  <motion.div
                    key="batches-list"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Create New Batch */}
                    <form onSubmit={createBatch} className="bg-white/5 p-8 rounded-3xl border border-white/10 flex gap-4">
                      <input 
                        type="text" 
                        value={newBatchName}
                        onChange={(e) => setNewBatchName(e.target.value)}
                        placeholder="Harvest Batch #001"
                        className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500/50"
                      />
                      <button type="submit" className="px-8 py-4 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-all shadow-lg active:scale-95 whitespace-nowrap">
                        New Batch
                      </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {batches.map((batch) => (
                        <div key={batch.id} className="bg-white/5 p-6 rounded-3xl border border-white/10 group relative">
                          {editingBatch?.id === batch.id ? (
                            <form onSubmit={updateBatch} className="space-y-4 mb-6">
                              <input 
                                autoFocus
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-white/10 border border-yellow-500/50 rounded-xl px-4 py-2 text-white outline-none"
                              />
                              <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-yellow-400 text-black text-[10px] font-black uppercase py-2 rounded-lg">Save</button>
                                <button type="button" onClick={() => setEditingBatch(null)} className="flex-1 bg-white/10 text-white text-[10px] font-black uppercase py-2 rounded-lg">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 block mb-1">
                                  {new Date(batch.created_at).toLocaleDateString()}
                                </span>
                                <h3 className="text-xl font-black tracking-tight">{batch.name}</h3>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  batch.status === 'active' ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 'bg-white/10 text-white/40'
                                }`}>
                                  {batch.status}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => { setEditingBatch(batch); setEditName(batch.name); }}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all transform"
                                    title="Edit Name"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                  </button>
                                  <button 
                                    onClick={() => deleteBatch(batch.id)}
                                    className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 transition-all transform"
                                    title="Delete Batch"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-end">
                            <div className="text-white/40 text-xs">
                              Orders: <span className="text-white font-mono">{orders.filter(o => o.batch_id === batch.id).length}</span>
                            </div>
                            {batch.status === 'active' && !editingBatch && (
                              <button 
                                onClick={() => closeBatch(batch.id)}
                                className="px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:border-red-500/50 hover:text-red-500 transition-all"
                              >
                                Close Batch
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="settings-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="space-y-8"
                  >
                    <div className="bg-white/5 p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px]" />
                      
                      <h2 className="text-3xl font-black mb-8 tracking-tighter">Global Store Settings</h2>
                      
                      <div className="space-y-8 max-w-md">
                        <div className="space-y-3">
                          <label className="text-xs uppercase tracking-[0.2em] font-bold text-yellow-500/80">
                            International Shipping Rate (₹)
                          </label>
                          <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-mono text-xl group-focus-within:text-yellow-500 transition-colors">₹</span>
                            <input 
                              type="number" 
                              value={shippingRate}
                              onChange={(e) => setShippingRate(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-5 text-2xl font-mono text-white focus:outline-none focus:border-yellow-500/50 transition-all"
                            />
                          </div>
                          <p className="text-white/30 text-[10px] leading-relaxed italic">
                            This rate is applied globally at checkout. Change it here to instantly update what customers pay for shipping.
                          </p>
                        </div>

                        <button 
                          onClick={saveSettings}
                          disabled={isSavingSettings}
                          className="w-full py-5 bg-yellow-400 text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isSavingSettings ? (
                            <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          ) : 'Save Settings'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Order Details Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-40">
                <AnimatePresence mode="wait">
                  {selectedOrder ? (
                    <motion.div
                      key={selectedOrder.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
                    >
                      <h2 className="text-2xl font-black mb-6 tracking-tight flex items-center justify-between">
                        Order Details
                        <span className="bg-white/10 text-[10px] px-2 py-1 rounded font-mono text-white/40">#{selectedOrder.id.slice(0, 8)}</span>
                      </h2>

                      <div className="space-y-5">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-3">Customer Info</label>
                          <div className="bg-white/5 rounded-2xl p-4 space-y-2 border border-white/5">
                            <p className="text-lg font-bold">{selectedOrder.customer_name}</p>
                            <p className="text-white/50 text-sm flex items-center gap-2">
                              <span className="text-yellow-500/50">✉</span> {selectedOrder.customer_email}
                            </p>
                            <p className="text-white/50 text-sm flex items-center gap-2">
                              <span className="text-yellow-500/50">📞</span> {(selectedOrder as any).customer_phone || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-3">Shipping Address</label>
                          <div className="bg-white/5 rounded-2xl p-4 space-y-1 border border-white/5">
                            <p className="text-white/80 text-sm leading-relaxed">{(selectedOrder as any).address || selectedOrder.customer_address || "N/A"}</p>
                            <p className="text-white/50 text-sm">{(selectedOrder as any).city || ""}{(selectedOrder as any).zip ? `, ${(selectedOrder as any).zip}` : ""}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-2">Items</label>
                          <div className="space-y-3">
                            {selectedOrder.order_items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 text-sm">
                                <span className="font-medium">{item.product_name} x {item.quantity}</span>
                                <span className="font-mono text-white/60">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                              </div>

                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                          <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-2">Payment</label>
                          <div className="flex justify-between text-white/60 text-xs font-mono mb-1">
                            <span>Payment ID:</span>
                            <span>{selectedOrder.payment_id}</span>
                          </div>
                          <div className="flex justify-between text-white/60 text-xs font-mono">
                            <span>Transaction:</span>
                            <span className="text-green-500">Verified</span>
                          </div>
                        </div>

                        {/* Batch Management for Order */}
                        <div className="pt-6 border-t border-white/10">
                          <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-4">Assigned Batch</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => reassignOrder(selectedOrder.id, null)}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${!selectedOrder.batch_id ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/5 bg-white/5 text-white/30 hover:bg-white/10'}`}
                            >
                              Unassigned
                            </button>
                            {batches.map(batch => (
                              <button 
                                key={batch.id}
                                onClick={() => reassignOrder(selectedOrder.id, batch.id)}
                                className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all truncate ${selectedOrder.batch_id === batch.id ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-white/5 bg-white/5 text-white/30 hover:bg-white/10'}`}
                              >
                                {batch.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-white/20 italic text-sm">
                      Select an order to view full details and customer address.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

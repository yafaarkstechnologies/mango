"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { sendShippingUpdateAction } from "@/app/actions/email";
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

interface Product {
  id: string;
  name: string;
  stock_quantity: number;
  track_inventory: boolean;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_address: string; // Keep for legacy
  flat_no?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  zip?: string;
  customer_phone?: string;
  total_amount: number;
  payment_id: string;
  status: string;
  batch_id?: string;
  order_items: OrderItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "batches" | "products" | "settings">("orders");
  const [newBatchName, setNewBatchName] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  
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

    // Fetch Products
    const { data: pData, error: pError } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    
    if (pError) console.error("Error fetching products:", pError);
    else setProducts(pData || []);

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

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id);

    if (error) {
      alert(`Error updating product: ${error.message}`);
    } else {
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

  const toggleOrderSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedOrderIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedOrderIds(newSelected);
  };

  const selectAllFiltered = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedOrderIds.size === 0) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .in('id', Array.from(selectedOrderIds));

    if (error) alert("Error updating orders");
    else {
      alert(`Updated ${selectedOrderIds.size} orders to ${status}`);
      
      // Send shipping update emails if status is shipped
      if (status === 'shipped') {
        const shippedOrders = orders.filter(o => selectedOrderIds.has(o.id));
        for (const order of shippedOrders) {
           await sendShippingUpdateAction(order);
        }
      }

      setSelectedOrderIds(new Set());
      fetchData();
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    const headers = ["Order ID", "Date", "Customer Name", "Email", "Phone", "Flat No", "Address 1", "Address 2", "City", "Zip", "Amount", "Items", "Status"];
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.customer_email,
      o.customer_phone || "",
      o.flat_no || "",
      o.address_line_1 || "",
      o.address_line_2 || "",
      o.city || "",
      o.zip || "",
      o.total_amount,
      o.order_items.map(i => `${i.product_name} (x${i.quantity})`).join("; "),
      o.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${batchFilter === 'all' ? 'all' : batches.find(b => b.id === batchFilter)?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };


  return (
    <main className="min-h-screen bg-[#021a02] text-zinc-900 font-sans selection:bg-amber-600/30 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto pt-40 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-amber-200 bg-amber-50 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Admin Control</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              {activeTab === 'orders' ? 'Order Dashboard' : 'Batch Manager'}
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white shadow-sm border-zinc-200 p-1 rounded-2xl border border-zinc-200">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'orders' ? 'bg-zinc-900 text-white shadow-lg shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('batches')}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'batches' ? 'bg-zinc-900 text-white shadow-lg shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Batches
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'products' ? 'bg-zinc-900 text-white shadow-lg shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'settings' ? 'bg-zinc-900 text-white shadow-lg shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Settings
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-white shadow-sm border-zinc-200 rounded-2xl animate-pulse w-full border border-zinc-200" />
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
                    {/* Bulk Actions & Export Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white shadow-sm border-zinc-200 p-4 rounded-2xl border border-zinc-200">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={selectAllFiltered}
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                          {selectedOrderIds.size === filteredOrders.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {selectedOrderIds.size > 0 && (
                          <div className="flex items-center gap-2 pl-4 border-l border-zinc-200">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{selectedOrderIds.size} Selected</span>
                            <button 
                              onClick={() => bulkUpdateStatus('shipped')}
                              className="px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-black uppercase rounded-lg border border-green-500/20 hover:bg-green-500/30 transition-all"
                            >
                              Mark Shipped
                            </button>
                            <button 
                              onClick={() => bulkUpdateStatus('cancelled')}
                              className="px-3 py-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-lg border border-red-500/20 hover:bg-red-500/30 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={exportToCSV}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                      </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex items-center gap-4 bg-white shadow-sm border-zinc-200 p-4 rounded-2xl border border-zinc-200 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold whitespace-nowrap">Filter by Batch:</span>
                      <button 
                        onClick={() => setBatchFilter('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all transition-colors duration-300 ${batchFilter === 'all' ? 'bg-zinc-900 text-white' : 'bg-white shadow-sm border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                      >
                        All Orders
                      </button>
                      {batches.map(batch => (
                        <button 
                          key={batch.id}
                          onClick={() => setBatchFilter(batch.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all transition-colors duration-300 whitespace-nowrap ${batchFilter === batch.id ? 'bg-zinc-900 text-white' : 'bg-white shadow-sm border-zinc-200 text-zinc-500 hover:text-zinc-900'}`}
                        >
                          {batch.name}
                        </button>
                      ))}
                    </div>

                    {filteredOrders.length === 0 ? (
                      <div className="py-20 text-center rounded-3xl border border-dashed border-zinc-200 text-zinc-400 italic">
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
                              ? 'bg-amber-50 border-amber-300' 
                              : 'bg-white shadow-sm border-zinc-200 border-zinc-200 hover:border-zinc-300 hover:bg-white/1'
                          } ${selectedOrderIds.has(order.id) ? 'ring-2 ring-amber-400' : ''}`}
                        >
                          <div className="flex items-center gap-6">
                            <div 
                              onClick={(e) => toggleOrderSelection(order.id, e)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                selectedOrderIds.has(order.id) ? 'bg-zinc-900 border-yellow-400' : 'border-zinc-300'
                              }`}
                            >
                              {selectedOrderIds.has(order.id) && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            <div className="flex flex-col gap-1">
                            <span className="font-mono text-xs text-zinc-400 uppercase tracking-tighter">
                              {new Date(order.created_at).toLocaleDateString()}
                              {order.batch_id && <span className="ml-2 text-amber-500">Batch: {batches.find(b => b.id === order.batch_id)?.name || 'Unknown'}</span>}
                            </span>
                            <h3 className="text-xl font-bold">{order.customer_name}</h3>
                            <span className="text-zinc-500 text-sm truncate max-w-[200px]">{order.customer_email}</span>
                          </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                                order.status === 'shipped' ? 'bg-green-500/20 text-green-500' : 
                                order.status === 'paid' ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-100 text-zinc-500'
                              }`}>
                                {order.status}
                              </span>
                              <div className="flex flex-col items-end">
                                <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Total</span>
                                <span className="text-xl font-mono text-amber-600">₹{Number(order.total_amount).toFixed(2)}</span>
                              </div>
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
                    <form onSubmit={createBatch} className="bg-white shadow-sm border-zinc-200 p-8 rounded-3xl border border-zinc-200 flex gap-4">
                      <input 
                        type="text" 
                        value={newBatchName}
                        onChange={(e) => setNewBatchName(e.target.value)}
                        placeholder="Harvest Batch #001"
                        className="flex-grow bg-white shadow-sm border-zinc-200 border border-zinc-200 rounded-2xl px-6 py-4 text-zinc-900 focus:outline-none focus:border-amber-400"
                      />
                      <button type="submit" className="px-8 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 transition-all shadow-lg active:scale-95 whitespace-nowrap">
                        New Batch
                      </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {batches.map((batch) => (
                        <div key={batch.id} className="bg-white shadow-sm border-zinc-200 p-6 rounded-3xl border border-zinc-200 group relative">
                          {editingBatch?.id === batch.id ? (
                            <form onSubmit={updateBatch} className="space-y-4 mb-6">
                              <input 
                                autoFocus
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-zinc-100 border border-amber-400 rounded-xl px-4 py-2 text-zinc-900 outline-none"
                              />
                              <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-zinc-900 text-white text-[10px] font-black uppercase py-2 rounded-lg">Save</button>
                                <button type="button" onClick={() => setEditingBatch(null)} className="flex-1 bg-zinc-100 text-zinc-900 text-[10px] font-black uppercase py-2 rounded-lg">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                                  {new Date(batch.created_at).toLocaleDateString()}
                                </span>
                                <h3 className="text-xl font-black tracking-tight">{batch.name}</h3>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  batch.status === 'active' ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                  {batch.status}
                                </span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => { setEditingBatch(batch); setEditName(batch.name); }}
                                    className="p-1.5 rounded-lg bg-white shadow-sm border-zinc-200 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all transform"
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
                            <div className="flex-1 mr-4">
                              <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-400 mb-1.5">
                                <span>Capacity</span>
                                <span>{Math.round((orders.filter(o => o.batch_id === batch.id).length / (batch.max_capacity || 50)) * 100)}%</span>
                              </div>
                              <div className="h-1 bg-white shadow-sm border-zinc-200 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (orders.filter(o => o.batch_id === batch.id).length / (batch.max_capacity || 50)) * 100)}%` }}
                                  className={`h-full ${orders.filter(o => o.batch_id === batch.id).length >= (batch.max_capacity || 50) ? 'bg-red-500' : 'bg-zinc-900/50'}`}
                                />
                              </div>
                            </div>
                            <div className="text-zinc-500 text-xs whitespace-nowrap">
                              Orders: <span className="text-zinc-900 font-mono">{orders.filter(o => o.batch_id === batch.id).length}</span> / {batch.max_capacity || 50}
                            </div>
                          </div>
                            {batch.status === 'active' && !editingBatch && (
                              <button 
                                onClick={() => closeBatch(batch.id)}
                                className="px-4 py-2 rounded-xl border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:border-red-500/50 hover:text-red-500 transition-all"
                              >
                                Close Batch
                              </button>
                            )}
                          </div>
                      ))}
                    </div>
                  </motion.div>
                ) : activeTab === 'products' ? (
                  <motion.div
                    key="inventory-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      {products.map((product) => (
                        <div key={product.id} className="bg-white shadow-sm border-zinc-200 p-8 rounded-[2rem] border border-zinc-200 backdrop-blur-sm group">
                          <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="flex-grow">
                              <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">{product.name}</h3>
                              <p className="text-zinc-400 text-xs font-mono mb-6 italic">ID: {product.id}</p>
                              
                              <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-3 bg-white shadow-sm border-zinc-200 px-4 py-2 rounded-xl border border-zinc-200">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status:</span>
                                  {product.stock_quantity > 0 ? (
                                    <span className="text-[10px] font-black uppercase text-green-500">In Stock</span>
                                  ) : (
                                    <span className="text-[10px] font-black uppercase text-red-500">Sold Out</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 bg-white shadow-sm border-zinc-200 px-4 py-2 rounded-xl border border-zinc-200">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Price:</span>
                                  <span className="text-[10px] font-black text-amber-600">₹{product.price}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col md:items-end justify-center gap-6 min-w-[280px]">
                              <div className="flex items-center gap-4">
                                <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Stock Quantity:</span>
                                <div className="flex items-center bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
                                  <button 
                                    onClick={() => updateProduct(product.id, { stock_quantity: Math.max(0, product.stock_quantity - 1) })}
                                    className="px-4 py-2 hover:bg-white shadow-sm border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors border-r border-zinc-200"
                                  >
                                    -
                                  </button>
                                  <input 
                                    type="number" 
                                    value={product.stock_quantity}
                                    onChange={(e) => updateProduct(product.id, { stock_quantity: parseInt(e.target.value) || 0 })}
                                    className="w-16 bg-transparent text-center font-mono text-lg focus:outline-none"
                                  />
                                  <button 
                                    onClick={() => updateProduct(product.id, { stock_quantity: product.stock_quantity + 1 })}
                                    className="px-4 py-2 hover:bg-white shadow-sm border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors border-l border-zinc-200"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Track Inventory:</span>
                                <button 
                                  onClick={() => updateProduct(product.id, { track_inventory: !product.track_inventory })}
                                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${product.track_inventory ? 'bg-zinc-900' : 'bg-zinc-100'}`}
                                >
                                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-zinc-900 transition-all duration-300 ${product.track_inventory ? 'left-7' : 'left-1'}`} />
                                </button>
                              </div>
                            </div>
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
                    <div className="bg-white shadow-sm border-zinc-200 p-12 rounded-[2.5rem] border border-zinc-200 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-50 rounded-full blur-[100px]" />
                      
                      <h2 className="text-3xl font-black mb-8 tracking-tighter">Global Store Settings</h2>
                      
                      <div className="space-y-8 max-w-md">
                        <div className="space-y-3">
                          <label className="text-xs uppercase tracking-[0.2em] font-bold text-amber-600">
                            International Shipping Rate (₹)
                          </label>
                          <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xl group-focus-within:text-amber-600 transition-colors">₹</span>
                            <input 
                              type="number" 
                              value={shippingRate}
                              onChange={(e) => setShippingRate(e.target.value)}
                              className="w-full bg-white shadow-sm border-zinc-200 border border-zinc-200 rounded-2xl px-12 py-5 text-2xl font-mono text-zinc-900 focus:outline-none focus:border-amber-400 transition-all"
                            />
                          </div>
                          <p className="text-zinc-400 text-[10px] leading-relaxed italic">
                            This rate is applied globally at checkout. Change it here to instantly update what customers pay for shipping.
                          </p>
                        </div>

                        <button 
                          onClick={saveSettings}
                          disabled={isSavingSettings}
                          className="w-full py-5 bg-zinc-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isSavingSettings ? (
                            <span className="w-5 h-5 border-2 border-black/20 border-t-zinc-900 rounded-full animate-spin" />
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
                      className="rounded-3xl border border-zinc-200 bg-white shadow-sm border-zinc-200 p-8 backdrop-blur-xl"
                    >
                      <h2 className="text-2xl font-black mb-6 tracking-tight flex items-center justify-between">
                        Order Details
                        <span className="bg-zinc-100 text-[10px] px-2 py-1 rounded font-mono text-zinc-500">#{selectedOrder.id.slice(0, 8)}</span>
                      </h2>

                      <div className="space-y-5">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block mb-3">Customer Info</label>
                          <div className="bg-white shadow-sm border-zinc-200 rounded-2xl p-4 space-y-2 border border-zinc-200">
                            <p className="text-lg font-bold">{selectedOrder.customer_name}</p>
                            <p className="text-zinc-500 text-sm flex items-center gap-2">
                              <span className="text-amber-500">✉</span> {selectedOrder.customer_email}
                            </p>
                            <p className="text-zinc-500 text-sm flex items-center gap-2">
                              <span className="text-amber-500">📞</span> {(selectedOrder as any).customer_phone || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block mb-3">Shipping Address</label>
                          <div className="bg-white shadow-sm border-zinc-200 rounded-2xl p-4 space-y-2 border border-zinc-200">
                            {selectedOrder.flat_no || selectedOrder.address_line_1 ? (
                              <>
                                <p className="text-zinc-800 text-sm font-bold">{selectedOrder.flat_no ? `Flat/House: ${selectedOrder.flat_no}` : ''}</p>
                                <p className="text-zinc-800 text-sm leading-relaxed">{selectedOrder.address_line_1}</p>
                                {selectedOrder.address_line_2 && <p className="text-zinc-500 text-xs italic">{selectedOrder.address_line_2}</p>}
                              </>
                            ) : (
                              <p className="text-zinc-800 text-sm leading-relaxed">{selectedOrder.customer_address || "N/A"}</p>
                            )}
                            <p className="text-zinc-500 text-sm pt-2 border-t border-zinc-200">
                              {selectedOrder.city || "Mumbai"}{selectedOrder.zip ? `, ${selectedOrder.zip}` : ""}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block mb-2">Items</label>
                          <div className="space-y-3">
                            {selectedOrder.order_items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white shadow-sm border-zinc-200 p-3 rounded-xl border border-zinc-200 text-sm">
                                <span className="font-medium">{item.product_name} x {item.quantity}</span>
                                <span className="font-mono text-zinc-600">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                              </div>

                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-zinc-200">
                          <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block mb-2">Payment</label>
                          <div className="flex justify-between text-zinc-600 text-xs font-mono mb-1">
                            <span>Payment ID:</span>
                            <span>{selectedOrder.payment_id}</span>
                          </div>
                          <div className="flex justify-between text-zinc-600 text-xs font-mono">
                            <span>Transaction:</span>
                            <span className="text-green-500">Verified</span>
                          </div>
                        </div>

                        {/* Batch Management for Order */}
                        <div className="pt-6 border-t border-zinc-200">
                          <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold block mb-4">Assigned Batch</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => reassignOrder(selectedOrder.id, null)}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${!selectedOrder.batch_id ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-zinc-200 bg-white shadow-sm border-zinc-200 text-zinc-400 hover:bg-zinc-100'}`}
                            >
                              Unassigned
                            </button>
                            {batches.map(batch => (
                              <button 
                                key={batch.id}
                                onClick={() => reassignOrder(selectedOrder.id, batch.id)}
                                className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all truncate ${selectedOrder.batch_id === batch.id ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-zinc-200 bg-white shadow-sm border-zinc-200 text-zinc-400 hover:bg-zinc-100'}`}
                              >
                                {batch.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-zinc-200 p-12 text-center text-zinc-400 italic text-sm">
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

"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Package, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  ChevronRight,
  Search,
  Box,
  Image as ImageIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { deleteProductAction, createProductAction, updateProductAction } from "@/app/actions/products";
import { supabase } from "@/lib/supabase";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    image_placeholder: "",
    category: "Fresh",
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, product_options(*)")
      .order("created_at", { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createProductAction(newProduct);
    if (result.success) {
      setIsAddModalOpen(false);
      setNewProduct({ name: "", description: "", price: 0, stock_quantity: 0, image_placeholder: "", category: "Fresh", is_active: true });
      fetchProducts();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const result = await deleteProductAction(id);
      if (result.success) fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Products</h1>
          <p className="text-zinc-500 font-medium mt-1">Manage your inventory and product variants.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-600"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-zinc-900/40 rounded-[2rem] animate-pulse border border-white/5" />)
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500 bg-zinc-900/40 rounded-[2rem] border border-white/5">
            No products found. Add one to get started.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <motion.div 
              layout
              key={product.id}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 hover:border-white/10 transition-all group relative overflow-hidden"
            >
              {/* Image Placeholder */}
              <div className="aspect-video bg-black/40 rounded-[1.5rem] mb-6 flex items-center justify-center relative overflow-hidden">
                {product.image_placeholder ? (
                  <img src={product.image_placeholder} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                    {product.category || "Fresh"}
                  </div>
                  {!product.is_active && (
                    <div className="px-3 py-1 rounded-full bg-red-500/80 backdrop-blur-md text-[10px] font-bold text-white border border-red-500/20 uppercase tracking-widest">
                      Inactive
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{product.name}</h3>
                    <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Base Price</span>
                    <span className="text-white font-bold text-lg">₹{product.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Stock</span>
                    <span className={cn(
                      "font-bold text-lg",
                      product.stock_quantity > 10 ? "text-green-500" : "text-red-400"
                    )}>
                      {product.stock_quantity || 0}
                    </span>
                  </div>
                </div>

                {/* Variants Preview */}
                {product.product_options?.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Variants</span>
                    <div className="flex flex-wrap gap-2">
                      {product.product_options.map((opt: any) => (
                        <div key={opt.id} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-white font-medium">
                          {opt.name} • ₹{opt.price}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-6">
                   <button 
                    onClick={async () => {
                      const newStatus = !product.is_active;
                      const res = await updateProductAction(product.id, { is_active: newStatus });
                      if (res.success) fetchProducts();
                    }}
                    className={cn(
                      "p-3 rounded-2xl transition-all border",
                      product.is_active 
                        ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20" 
                        : "bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 border-zinc-500/20"
                    )}
                    title={product.is_active ? "Mark Inactive" : "Mark Active"}
                  >
                    <Box size={18} />
                  </button>
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/5">
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all border border-red-500/20"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Product Modal Placeholder */}
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
              className="relative bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Create New Product</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase px-1 tracking-wider">Product Name</label>
                  <input 
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                    placeholder="Alphonso Mango Box" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase px-1 tracking-wider">Description</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none min-h-[100px]" 
                    placeholder="Describe your product..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase px-1 tracking-wider">Base Price (₹)</label>
                    <input 
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase px-1 tracking-wider">Initial Stock</label>
                    <input 
                      type="number"
                      required
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({...newProduct, stock_quantity: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase px-1 tracking-wider">Image URL</label>
                  <input 
                    value={newProduct.image_placeholder}
                    onChange={(e) => setNewProduct({...newProduct, image_placeholder: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-orange-500/50 outline-none" 
                    placeholder="https://example.com/mango.jpg" 
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <input 
                    type="checkbox"
                    id="is_active"
                    checked={newProduct.is_active}
                    onChange={(e) => setNewProduct({...newProduct, is_active: e.target.checked})}
                    className="w-5 h-5 rounded-lg bg-black/40 border-white/10 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-white cursor-pointer">Product is active and visible on store</label>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Saving..." : "Save Product"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


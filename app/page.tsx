"use client";

import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import OurStory from "@/components/OurStory";
import WhyOrder from "@/components/WhyOrder";
import SizeComparison from "@/components/SizeComparison";
import Testimonials from "@/components/Testimonials";
import PromiseSection from "@/components/Promise";
import Cart from "@/components/Cart";
import { useCart } from "@/lib/store";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_placeholder: string;
}

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30">
      <Navbar />
      <Cart />

      {/* Hero Section */}
      <Hero />

      {/* The Honest Story */}
      <OurStory />

      {/* Why It Matters */}
      <WhyOrder />

      {/* Size Comparison Section */}
      <SizeComparison />

      {/* Premium E-commerce Section */}
      <section id="collection" className="relative z-10 w-full min-h-screen bg-[#050505] flex flex-col items-center py-32 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">

          <div className="mb-16 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-yellow-500/80 font-semibold">Limited 2026 Reserve</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-center mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase">
            SECURE YOUR BOX.
          </h1>

          <p className="text-xl md:text-2xl text-white/40 text-center max-w-2xl font-light tracking-wide mb-24">
            Directly from our orchards. No middlemen. No shortcuts. Just the legacy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full block">
            {isLoading ? (
              // Premium Skeleton Loader
              [1, 2, 3].map((i) => (
                <div key={i} className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 animate-pulse">
                  <div className="w-full aspect-square rounded-2xl bg-white/5 mb-8" />
                  <div className="h-8 bg-white/10 rounded-lg w-3/4 mb-4" />
                  <div className="h-4 bg-white/5 rounded-lg w-full mb-2" />
                  <div className="h-4 bg-white/5 rounded-lg w-5/6 mb-8" />
                  <div className="flex justify-between items-center">
                    <div className="h-10 bg-white/10 rounded-lg w-24" />
                    <div className="h-12 bg-white/10 rounded-full w-32" />
                  </div>
                </div>
              ))
            ) : (
              products.map((product) => (
                <div key={product.id} className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 hover:bg-white/10 transition-all duration-700 flex flex-col cursor-pointer overflow-hidden backdrop-blur-sm hover:border-yellow-500/30 hover:shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                  <div className={`absolute -top-12 -right-12 w-48 h-48 bg-yellow-500/10 rounded-full blur-[80px] group-hover:bg-yellow-500/20 transition-all duration-700`} />
                  
                  <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-500/10 mb-8 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <span className="text-white/20 font-mono text-xs uppercase tracking-widest z-10">{product.category}</span>
                  </div>

                  <h3 className="text-3xl font-black mb-3 tracking-tighter uppercase">{product.name}</h3>
                  <p className="text-white/50 text-base mb-8 flex-grow leading-relaxed font-light">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-white/30 font-bold mb-1">Per Dozen</span>
                      <span className="font-mono text-2xl font-light text-yellow-500/90">₹{Number(product.price).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => addToCart({ id: product.id, name: product.name, price: Number(product.price) })}
                      className="px-8 py-3 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-black uppercase tracking-widest shadow-lg shadow-yellow-900/20 hover:shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                    >
                      {product.name.includes("Royale") ? "Pre-order" : "Buy Now"}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/><path d="M5 12h14"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* The Promise */}
      <PromiseSection />

      {/* Footer */}
      <footer className="w-full py-24 border-t border-white/10 flex flex-col items-center justify-center bg-[#050505] relative z-20">
        <div className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-yellow-500 mb-4">
          MANGO MAMAJI
        </div>
        <p className="text-white/20 text-xs tracking-[0.5em] uppercase mb-8 font-black italic">The Royale Alphonso Relative</p>
        <p className="text-white/40 text-sm font-light">© 2026 Mango Mamaji. Your family in the farms.</p>
      </footer>
    </main>
  );
}

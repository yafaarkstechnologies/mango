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
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_placeholder: string;
  stock_quantity: number;
  track_inventory: boolean;
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
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-yellow-500/30">
      <Navbar />
      <Cart />

      {/* Hero Section */}
      <Hero />

      {/* Premium E-commerce Section */}
      <section id="collection" className="relative z-10 w-full min-h-screen bg-[#fafafa] flex flex-col items-center py-32 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">

          <div className="mb-16 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-yellow-500/80 font-semibold">Limited 2026 Reserve</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-center mb-6 text-zinc-900 uppercase">
            SECURE YOUR BOX.
          </h1>

          <p className="text-xl md:text-2xl text-zinc-500 text-center max-w-2xl font-light tracking-wide mb-24">
            Directly from our orchards. No middlemen. No shortcuts. Just the legacy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full block">
            {isLoading ? (
              // Premium Skeleton Loader
              [1, 2, 3].map((i) => (
                <div key={i} className="group relative rounded-3xl border border-zinc-200 bg-white p-8 animate-pulse shadow-sm">
                  <div className="w-full aspect-square rounded-2xl bg-zinc-100 mb-8" />
                  <div className="h-8 bg-zinc-200 rounded-lg w-3/4 mb-4" />
                  <div className="h-4 bg-zinc-100 rounded-lg w-full mb-2" />
                  <div className="h-4 bg-zinc-100 rounded-lg w-5/6 mb-8" />
                  <div className="flex justify-between items-center">
                    <div className="h-10 bg-zinc-200 rounded-lg w-24" />
                    <div className="h-12 bg-zinc-200 rounded-full w-32" />
                  </div>
                </div>
              ))
            ) : (
              products.map((product) => {
                const isOutOfStock = product.track_inventory && product.stock_quantity <= 0;

                return (
                  <div key={product.id} className={`group relative rounded-3xl border border-zinc-200 bg-white p-8 transition-all duration-700 flex flex-col cursor-pointer overflow-hidden backdrop-blur-sm shadow-sm ${isOutOfStock ? 'opacity-60 saturate-50' : 'hover:border-zinc-300 hover:shadow-md'}`}>
                    <div className={`absolute -top-12 -right-12 w-48 h-48 ${isOutOfStock ? 'bg-zinc-100' : 'bg-yellow-500/10'} rounded-full blur-[80px] transition-all duration-700`} />

                    {isOutOfStock && (
                      <div className="absolute top-8 right-8 z-20 px-4 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40">
                        Sold Out
                      </div>
                    )}

                    <div className="w-full aspect-square rounded-2xl bg-zinc-50 mb-8 flex items-center justify-center border border-zinc-100 relative overflow-hidden">
                      {product.image_placeholder ? (
                        <Image
                          src={product.image_placeholder}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-500/10" />
                          <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest z-10">{product.category}</span>
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    <h3 className="text-3xl font-black mb-3 tracking-tighter uppercase text-zinc-900">{product.name}</h3>
                    <p className="text-zinc-600 text-base mb-8 flex-grow leading-relaxed font-light">{product.description}</p>

                    <div className="flex flex-col gap-3 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">10 pcs</span>
                          <span className="font-mono text-2xl font-light text-amber-600">₹{Number(product.price).toFixed(2)}</span>
                        </div>
                        <button
                          disabled={isOutOfStock}
                          onClick={() => !isOutOfStock && addToCart({ 
                            id: product.id, 
                            name: product.name, 
                            price: Number(product.price),
                            image: product.image_placeholder || undefined
                          })}
                          className={`px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${isOutOfStock
                            ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                            : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-900/10 hover:shadow-yellow-500/30 hover:scale-105 active:scale-95'
                            }`}
                        >
                          {isOutOfStock ? "Out of Stock" : (product.name.includes("Royale") ? "Pre-order" : "Buy Now")}
                          {!isOutOfStock && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /><path d="M5 12h14" /></svg>}
                        </button>
                      </div>

                      {/* WhatsApp Alternative Ordering */}
                      <a
                        href={`https://wa.me/918976066914?text=Hi%20Mango%20Mango G!%20I'd%20like%20to%20order%20${encodeURIComponent(product.name)}.%20Please%20guide%20me%20on%20the%20next%20steps.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-2xl border border-zinc-200 flex items-center justify-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all text-xs uppercase tracking-[0.2em] font-bold group/wa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/wa:text-green-600 transition-colors"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        Order via WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Size Comparison Section */}
      <SizeComparison />

      {/* The Honest Story */}
      <OurStory />

      {/* Why It Matters */}
      <WhyOrder />


      {/* Testimonials */}
      <Testimonials />

      {/* The Promise */}
      <PromiseSection />

      {/* Footer */}
      <footer className="w-full py-24 border-t border-zinc-200 flex flex-col items-center justify-center bg-white relative z-20">
        <div className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500 mb-4">
          mango g
        </div>
        <p className="text-zinc-400 text-xs tracking-[0.5em] uppercase mb-8 font-black italic">The Royale Alphonso Relative</p>
        <p className="text-zinc-500 text-sm font-light">© 2026 Mango G. Your family in the farms.</p>
      </footer>
    </main>
  );
}

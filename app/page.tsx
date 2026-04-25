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
import { getGlobalSettings } from "@/lib/admin";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";

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
  const [harvestYear, setHarvestYear] = useState("2026");

  useEffect(() => {
    async function fetchData() {
      // Fetch settings
      const settings = await getGlobalSettings();
      setHarvestYear(settings.harvest_year);

      // Fetch products
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
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 font-sans selection:bg-yellow-500/30">
      <Navbar />
      <Cart />

      {/* Hero Section */}
      <Hero />

      {/* Size Comparison Section */}
      <SizeComparison />

      {/* The Honest Story */}
      <OurStory />

      {/* Why It Matters */}
      <WhyOrder />


      {/* Premium E-commerce Section */}
      <section id="collection" className="relative z-10 w-full min-h-screen bg-[#fafafa] flex flex-col items-center py-32 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">

          <div className="mb-16 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-yellow-500/80 font-semibold">Limited {harvestYear} Reserve</span>
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
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
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
      <footer className="w-full py-24 border-t border-zinc-200 flex flex-col items-center justify-center bg-white relative z-20">
        <div className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500 mb-4">
          mango g
        </div>
        <p className="text-zinc-400 text-xs tracking-[0.5em] uppercase mb-8 font-black italic">The Royale Alphonso Relative</p>
        <p className="text-zinc-500 text-sm font-light">© {harvestYear} Mango G. Your family in the farms.</p>
      </footer>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getGlobalSettings } from "@/lib/admin";
import Image from "next/image";
import ProductCard from "./ProductCard";

const FEATURES = [
  "Tree-to-box in 24 hrs",
  "No preservatives",
  "No calcium carbide",
  "Maharashtra origin",
  "300g+ each mango"
];

export default function Hero() {
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);
  const [harvestYear, setHarvestYear] = useState("2026");

  useEffect(() => {
    async function fetchData() {
      // Fetch settings
      const settings = await getGlobalSettings();
      setHarvestYear(settings.harvest_year);

      // Fetch featured product
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!error) {
        setFeaturedProduct(data);
      }
    }
    fetchData();
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-[#fafafa] pt-20">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col gap-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm w-fit group">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-yellow-500 font-black">✦ Season {harvestYear} — Now Open for Orders</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none text-zinc-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">MANGO G</span> <br />
              IS HERE.
            </h1>
            <p className="text-2xl md:text-3xl text-zinc-800 font-bold tracking-tight">
              Finally, mangoes like mamu used to send.
            </p>
          </div>

          <p className="text-xl text-zinc-500 max-w-xl font-light leading-relaxed">
            Everyone has that one relative with a farm. Boxes arrive every May, mangoes wrapped in newspaper, smelling like home. We're that relative — for everyone who never had one.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href="#collection"
              className="px-8 py-4 md:px-10 md:py-5 rounded-full bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] md:text-sm hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)] md:shadow-[0_0_30px_rgba(234,179,8,0.3)] flex items-center gap-2"
            >
              Order Now
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
            </a>
            <a
              href="#our-story"
              className="px-8 py-4 md:px-10 md:py-5 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-bold transition-all text-[10px] md:text-sm uppercase tracking-widest"
            >
              See how it works
            </a>
          </div>

          {featuredProduct && (
            <div className="lg:hidden w-full">
              <ProductCard product={featuredProduct} />
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 pt-8 border-t border-zinc-200">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -20, 0],
          }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            y: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="relative aspect-square hidden lg:flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-[100px] animate-pulse" />
          <Image
            src="/hero-mango-final.png"
            alt={`Season ${harvestYear} Premium Royale Mango`}
            width={800}
            height={800}
            priority
            className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_100px_rgba(234,179,8,0.3)]"
          />
        </motion.div>
      </div>
    </section>
  );
}

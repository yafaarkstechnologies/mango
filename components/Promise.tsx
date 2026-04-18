"use client";

import { motion } from "framer-motion";

export default function Promise() {
  return (
    <section className="relative w-full py-32 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-16 md:p-24 rounded-[4rem] bg-gradient-to-b from-zinc-50 to-white border border-zinc-200 shadow-sm relative"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(234,179,8,0.3)]">
            🥭
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 uppercase mb-8">
            Our simple promise to you.
          </h2>
          
          <p className="text-2xl md:text-3xl text-zinc-600 font-light leading-relaxed mb-12">
            If it doesn't taste like the best mango you've had in years — we'll make it right. No argument, no drama. Family doesn't do that to family.
          </p>

          <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-white border border-zinc-200 shadow-sm text-amber-600 font-bold uppercase tracking-widest text-xs">
            Full replacement or refund, your choice.
          </div>
        </motion.div>

        <div className="mt-32 space-y-12">
            <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                Alphonso season is short. Mid-April to end of June. Once the rains arrive, it's over for the year. Boxes are filling up fast — we only harvest what the trees give us.
            </p>
            
            <div className="flex flex-col items-center gap-8">
                <a 
                    href="#collection"
                    className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-yellow-500 text-black font-black text-xl uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(234,179,8,0.3)]"
                >
                    Order your box now
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
                
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-[0.4em] font-black text-zinc-400">
                    <span>Free delivery</span>
                    <span>Maharashtra farms</span>
                    <span>100% Alphonso</span>
                    <span>Season 2026</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}

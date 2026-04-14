"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const METRICS = [
  { label: "Average Weight", standard: "220g - 250g", royale: "300g - 450g+" },
  { label: "Texture Index", standard: "Fibrous", royale: "Buttery Smooth" },
  { label: "Aroma Range", standard: "Mild", royale: "Orchard Fresh" },
  { label: "Maturity", standard: "Artificially Ripened", royale: "Naturally Matured" },
];

export default function SizeComparison() {
  return (
    <section className="relative w-full py-32 bg-[#050505] overflow-hidden">
      {/* Subtle Background Text */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <span className="text-[20vw] font-black tracking-tighter uppercase">THE SCALE</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <span className="text-yellow-500 text-[10px] uppercase tracking-[0.3em] font-black italic">
              Scale Comparison
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            THE ROYALE <span className="text-yellow-500">DIFFERENCE</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto mt-6 text-xl font-light">
            When we say Royale, we mean it. Every Mamaji mango is hand-selected to be significantly larger and heavier than standard market offerings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Visual Comparison Area - Refactored to Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Standard Mango Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-between overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-[10px] uppercase tracking-[0.3em] font-black text-white/20">Common Market</span>
              
              <div className="relative w-full h-1/2">
                <Image 
                  src="/standard-mango-clean.png" 
                  alt="Standard Mango" 
                  fill 
                  className="object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
              </div>

              <div className="relative z-10 text-center">
                <p className="text-white/40 text-2xl font-mono">~250g</p>
                <span className="text-white/10 text-[8px] uppercase tracking-widest font-black">Average Weight</span>
              </div>
            </motion.div>

            {/* Royale Mango Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative aspect-square rounded-[2rem] bg-yellow-500/[0.02] border border-yellow-500/20 p-8 flex flex-col items-center justify-between overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/[0.05] to-transparent opacity-100" />
              <span className="relative z-10 text-[10px] uppercase tracking-[0.3em] font-black text-yellow-500">Mamaji Royale</span>
              
              <div className="relative w-full h-2/3">
                <Image 
                  src="/hero-mango-final.png" 
                  alt="Mamaji Royale Mango" 
                  fill 
                  className="object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-110 transition-transform duration-700"
                />
              </div>

              <div className="relative z-10 text-center">
                <p className="text-yellow-500 text-4xl font-mono font-black animate-pulse tracking-tighter">300g - 450g+</p>
                <span className="text-yellow-500/40 text-[8px] uppercase tracking-widest font-black">Reserve Weight</span>
              </div>
            </motion.div>

          </div>

          {/* Metrics Table */}
          <div className="space-y-4 lg:pt-0">
            {METRICS.map((metric, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-7 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 transition-all duration-500"
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-1">
                    <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold font-mono">{metric.label}</span>
                    <div className="flex items-center gap-6">
                        <span className="text-white/20 text-sm line-through decoration-white/10 uppercase font-black">{metric.standard}</span>
                        <div className="w-8 h-[1px] bg-white/10" />
                        <span className="text-yellow-500 font-black text-xl uppercase tracking-tight">{metric.royale}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-500/5 border border-yellow-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <div className="pt-8 text-center lg:text-left">
              <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-black italic">
                *Comparison based on average market weight versus Mamaji's strict selection criteria.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

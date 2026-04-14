"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

const STORY_STEPS = [
  {
    title: "The Honest Story",
    content: "We do it the way your family would. No middleman. No cold storage theatre. No white powder. Just mangoes that have actually ripened on the tree — the way nature intended.",
    highlight: "Real & Rare",
  },
  {
    title: "The Mamu Standard",
    content: "You know how you could tell your mamu's mangoes were real? You didn't have to wait. They smelled right the moment you opened the box. That smell only happens one way.",
    highlight: "Pure Nostalgia",
  },
  {
    title: "Direct Commitment",
    content: "We pluck each mango straight from the tree after natural colour break and put it directly into your box. That's it. No stops in between, just orchard freshness.",
    highlight: "Tree To Box",
  },
  {
    title: "Your Mango Mama",
    content: "Mango Mamaji is here for everyone who never had that farm relative. We bring that missing warmth and authenticity to your May mornings, wrapped in care.",
    highlight: "Belonging",
  }
];

export default function OurStory() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % STORY_STEPS.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + STORY_STEPS.length) % STORY_STEPS.length);
  };

  return (
    <section id="our-story" className="relative w-full py-32 bg-[#050505] overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <span className="text-yellow-500 text-[10px] uppercase tracking-[0.3em] font-black italic">
              The honest story
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            WE DO IT THE WAY <br className="hidden md:block" /> YOUR <span className="text-yellow-500">FAMILY</span> WOULD.
          </h2>
        </div>

        <div className="relative min-h-[600px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full flex flex-col lg:flex-row items-center gap-16"
            >
              {/* Visual Side */}
              <div className="w-full lg:w-1/2 aspect-square relative group">
                <div className="absolute inset-0 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors duration-700" />
                <div className="relative w-full h-full flex items-center justify-center border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm overflow-hidden">
                   {activeIndex % 2 === 0 ? (
                       <Image 
                       src="/hero-mango-final.png" 
                       alt="Tree Ripened Mango" 
                       width={450} 
                       height={450} 
                       className="object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] z-20"
                     />
                   ) : (
                    <Image 
                      src="/mamaji-artwork.png" 
                      alt="Mango Mamaji Artist" 
                      width={450} 
                      height={450} 
                      className="object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.2)] z-20"
                    />
                   )}
                </div>
                <div className="absolute -bottom-8 -left-8 text-8xl font-black text-white/5 select-none">
                  0{activeIndex + 1}
                </div>
              </div>

              {/* Text Side */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/5 border border-yellow-500/10">
                  <span className="text-yellow-500 text-[10px] uppercase tracking-[0.3em] font-black italic text-balance">
                    {STORY_STEPS[activeIndex].highlight}
                  </span>
                </div>
                <h3 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight uppercase">
                  {STORY_STEPS[activeIndex].title}
                </h3>
                <p className="text-2xl md:text-3xl text-white/50 font-light leading-relaxed max-w-xl">
                  {STORY_STEPS[activeIndex].content}
                </p>
                
                {/* Navigation Buttons */}
                <div className="flex items-center gap-6 pt-12">
                  <button 
                    onClick={prevSlide}
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-yellow-500 hover:border-yellow-500 transition-all duration-300 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-yellow-500 hover:border-yellow-500 transition-all duration-300 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                  <div className="flex gap-3 ml-4">
                    {STORY_STEPS.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? "w-12 bg-yellow-500" : "w-3 bg-white/10"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

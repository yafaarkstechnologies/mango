"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const STORY_STEPS = [
  {
    title: "The Legacy of Love",
    content: "In many Indian families, there is always that one beloved Mama who owns a mango farm and lovingly sends boxes of Alphonso mangoes every summer.",
    highlight: "A Family Tradition",
    bg: "from-orange-900/20 to-yellow-900/10"
  },
  {
    title: "More Than Fruit",
    content: "Those boxes don't just carry fruit; they carry joy, love, and memories, filling homes with the sweetness of the season.",
    highlight: "Pure Nostalgia",
    bg: "from-yellow-900/20 to-green-900/10"
  },
  {
    title: "The Missing Piece",
    content: "But what about those who don't have such a MamaJi in their life? The sweetness of summer shouldn't be a privilege of the few.",
    highlight: "The Gap",
    bg: "from-green-900/20 to-emerald-900/10"
  },
  {
    title: "Enter Mango Mamaji",
    content: "That is exactly why we started Mango Mamaji—to become your Mamaji! We bring that missing happiness to your doorstep.",
    highlight: "Your Family, Found",
    bg: "from-emerald-900/20 to-yellow-900/10"
  },
  {
    title: "A Taste of Home",
    content: "Mamaji is here to make sure you too receive mangoes packed with warmth, love, and sweetness, just like family would have done. With every box, we send you the feeling of home.",
    highlight: "Sweetness Secured",
    bg: "from-yellow-900/20 to-orange-900/10"
  }
];

export default function OurStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      const index = Math.min(
        STORY_STEPS.length - 1,
        Math.floor(v * STORY_STEPS.length)
      );
      setActiveIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[500vh] bg-[var(--experience-bg,#021a02)] transition-colors duration-1000"
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Dynamic Background Gradients */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 bg-gradient-to-br ${STORY_STEPS[activeIndex].bg} opacity-40 blur-[100px]`}
          />
        </AnimatePresence>

        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-[10%] w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 left-[15%] w-48 h-48 bg-green-500/10 rounded-full blur-3xl" 
          />
        </div>

        {/* Content Portal */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
          
          {/* Visual Side */}
          <div className="relative aspect-square hidden lg:flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.2, opacity: 0, rotate: 10 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-2xl animate-pulse" />
                {activeIndex >= 3 ? (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <Image 
                      src="/mamaji-artwork.png" 
                      alt="Mango Mamaji Artist" 
                      width={500} 
                      height={500} 
                      className="object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20"
                    />
                  </motion.div>
                ) : (
                  <Image 
                    src="/logo.png" 
                    alt="Mango Mamaji Visual" 
                    width={400} 
                    height={400} 
                    className="opacity-40 grayscale brightness-200 contrast-125"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Progress Counter */}
            <div className="absolute bottom-0 left-0 flex items-end gap-2">
              <span className="text-6xl font-black text-white/10 tabular-nums">0{activeIndex + 1}</span>
              <span className="text-xl font-bold text-white/5 pb-2 uppercase tracking-widest italic">/ 05</span>
            </div>
          </div>

          {/* Text Side */}
          <div className="flex flex-col justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-yellow-500 text-[10px] uppercase tracking-[0.3em] font-black italic">
                    {STORY_STEPS[activeIndex].highlight}
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
                  {STORY_STEPS[activeIndex].title}
                </h2>
                
                <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-xl text-balance">
                  {STORY_STEPS[activeIndex].content}
                </p>

                <div className="pt-8 flex items-center gap-4">
                  {STORY_STEPS.map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === activeIndex ? "w-12 bg-yellow-500" : "w-4 bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ scaleX: scrollYProgress }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-green-500 origin-left z-50"
        />
      </div>
    </section>
  );
}

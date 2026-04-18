"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "🌳",
    title: "Tree-ripened only",
    description: "Plucked after natural colour break, not before. The sugars, the aroma, the texture — all develop on the tree, not in a gas chamber."
  },
  {
    icon: "📦",
    title: "Farm to box, same day",
    description: "Plucked in the morning, packed by afternoon, dispatched the same evening. No cold storage, no weeks sitting in a warehouse."
  },
  {
    icon: "🚫",
    title: "Zero calcium carbide",
    description: "The white powder used on market mangoes — it's a ripening agent that's illegal for food use. Our mangoes have none of it. You'll taste the difference."
  },
  {
    icon: "⚖️",
    title: "300g+ per mango",
    description: "Real Alphonso from Maharashtra. Not Kesar pretending. Each fruit is large, heavy, and actually worth cutting open."
  }
];

export default function WhyOrder() {
  return (
    <section className="relative w-full py-32 bg-[#fafafa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm mb-6 w-fit">
            <span className="text-yellow-500 text-[10px] uppercase tracking-[0.3em] font-black italic">
              Why it matters
            </span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 leading-tight uppercase">
            What most mango sellers <br className="hidden lg:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">won't say out loud.</span>
          </h2>
          <p className="text-2xl text-zinc-600 font-light mt-8 max-w-3xl">
            The market is full of shortcuts. Here's what you're actually getting from us — and what you're avoiding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-10 rounded-[2.5rem] bg-white border border-zinc-200 hover:border-amber-400 hover:shadow-md shadow-sm transition-all duration-500 hover:bg-zinc-50"
            >
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500 inline-block">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-6 uppercase tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-500 text-lg font-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* By the numbers overlay */}
        <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-12 py-16 border-t border-zinc-200">
            {[
                { val: "300g+", label: "Weight per mango" },
                { val: "<24h", label: "Farm to dispatch" },
                { val: "0", label: "Preservatives used" },
                { val: "100%", label: "Alphonso variety" }
            ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                    <div className="text-5xl md:text-6xl font-black text-amber-500 mb-2 tracking-tighter">
                        {stat.val}
                    </div>
                    <div className="text-xs uppercase tracking-[0.3em] font-black text-zinc-400 italic">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}

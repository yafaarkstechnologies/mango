"use client";

import { motion } from "framer-motion";

const REVIEWS = [
  {
    initials: "PR",
    name: "Priya R.",
    location: "Pune",
    content: "My nana's farm was in Ratnagiri. When she passed, I thought that was the last time I'd ever eat a mango that tasted like *that*. First box from you proved me wrong. I cried a little, not going to lie."
  },
  {
    initials: "AK",
    name: "Arjun K.",
    location: "Mumbai",
    content: "I've ordered from three other premium mango brands. They all look good in photos. The moment I opened this box — the smell hit first. That's how you know. Just ordered a second box for my parents."
  },
  {
    initials: "SM",
    name: "Sneha M.",
    location: "Bengaluru",
    content: "My kids have never tasted 'real' mangoes — everything they've had is from supermarkets. I wanted them to have what I had growing up. This box was exactly that. They ate four in one sitting."
  }
];

export default function Testimonials() {
  return (
    <section className="relative w-full py-32 bg-[#fafafa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm mb-6">
            <span className="text-yellow-500 text-[10px] uppercase tracking-[0.3em] font-black italic">
              What customers say
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 uppercase">
            From people who've had <br className="hidden md:block" />
            <span className="text-yellow-500">the real thing</span> before.
          </h2>
          <p className="text-zinc-600 max-w-2xl mx-auto mt-6 text-xl font-light">
            These aren't people easily fooled. They grew up with farm mangoes and they know the difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-12 rounded-[3rem] bg-white border border-zinc-200 shadow-sm flex flex-col justify-between hover:border-zinc-300 hover:shadow-md hover:-translate-y-1 transition-all duration-500 group"
            >
              <div className="space-y-8">
                <div className="flex items-center gap-1 text-yellow-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ))}
                </div>
                <p className="text-2xl text-zinc-800 font-light leading-relaxed italic">
                  "{review.content}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-12 pt-8 border-t border-zinc-200">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black text-sm">
                  {review.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-zinc-900 font-black uppercase text-sm tracking-widest">{review.name}</span>
                  <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold font-mono">{review.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

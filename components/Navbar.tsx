"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 rounded-b-3xl ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b-[0.5px] border-zinc-200 py-1.5 shadow-sm" : "bg-transparent py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo left */}
        <Link href="/" className="flex items-center gap-4 relative cursor-pointer group">
           <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 blur-2xl rounded-full scale-0 group-hover:scale-[2.0] transition-transform duration-700" />
           <Image 
            src="/logo.png" 
            alt="Mango G Logo" 
            width={80} 
            height={80} 
            priority
            className="relative z-10 w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-transform duration-500 group-hover:scale-105"
          />
          <h1 className={`text-2xl font-black tracking-tighter text-transparent bg-clip-text hidden md:block ${scrolled ? 'bg-gradient-to-r from-amber-600 to-yellow-500' : 'bg-gradient-to-r from-yellow-100 to-yellow-500 backdrop-blur-sm drop-shadow-md'}`}>
            mango g
          </h1>
        </Link>

        {/* Navigation links center */}
        <ul className="hidden md:flex items-center gap-8">
          {["Collection", "Our Story"].map((item) => (
            <li key={item}>
              <a 
                href={`#${item.toLowerCase().replace(" ", "-")}`} 
                className={`transition-colors text-sm font-bold tracking-wide uppercase relative group ${scrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/90 hover:text-white drop-shadow-md'}`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-yellow-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
              </a>
            </li>
          ))}
        </ul>

        {/* Call to action right */}
        <div>
           <a 
            href="#collection"
            className="px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] md:text-sm transition-all duration-300 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-105 active:scale-95"
           >
            Order Now
           </a>
        </div>
      </div>
    </motion.nav>
  );
}

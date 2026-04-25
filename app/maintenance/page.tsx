"use client";

import Image from "next/image";
import Link from "next/link";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center selection:bg-yellow-500/30">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-yellow-400 blur-[100px] opacity-20 rounded-full scale-150" />
        <div className="relative">
          <Image 
            src="/logo.png" 
            alt="Mango G" 
            width={120} 
            height={120} 
            className="mx-auto drop-shadow-2xl animate-float"
          />
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-yellow-500/80 font-semibold">Tending to the Orchards</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 uppercase mb-6 leading-none">
          Harvest <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">Pending.</span>
        </h1>

        <p className="text-xl md:text-2xl text-zinc-500 font-light tracking-wide mb-12 leading-relaxed">
          We're currently preparing our digital stalls for the 2026 season. 
          The orchards are blooming, and we'll be back online soon to take your pre-orders.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="https://instagram.com" 
            target="_blank"
            className="px-8 py-4 rounded-full bg-zinc-900 text-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all shadow-lg"
          >
            Follow the Bloom
          </Link>
          <Link 
            href="/admin" 
            className="px-8 py-4 rounded-full border border-zinc-200 bg-white text-zinc-500 font-bold uppercase tracking-widest text-sm hover:border-amber-400 hover:text-zinc-900 transition-all shadow-sm"
          >
            Admin Access
          </Link>
        </div>
      </div>

      <footer className="mt-24">
        <p className="text-zinc-400 text-xs tracking-[0.5em] uppercase font-black italic">The Royale Alphonso Relative</p>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

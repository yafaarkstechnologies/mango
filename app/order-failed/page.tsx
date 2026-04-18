"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

function OrderFailedContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#021a02] text-white flex flex-col items-center justify-center px-6 py-24 selection:bg-red-500/30">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-orange-900/15 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        className="relative z-10 max-w-lg w-full flex flex-col items-center text-center"
      >
        {/* Animated X */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="relative w-32 h-32 mb-10"
        >
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="w-32 h-32 rounded-full border-2 border-red-500/30 bg-red-500/10 flex items-center justify-center">
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </motion.svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 mb-10"
        >
          <span className="text-red-400 text-xs font-black uppercase tracking-[0.4em]">Payment Failed</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-red-400">
            Don't Worry!
          </h1>
          <p className="text-xl text-white/50 font-light">
            Your payment was not processed and no amount was deducted. Please try again.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full bg-white/5 border border-red-500/20 rounded-3xl p-8 mb-10 text-left space-y-4"
        >
          <h3 className="font-bold text-white/80 text-lg">Common Reasons for Failure:</h3>
          <ul className="space-y-3 text-white/50 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5">→</span>
              Insufficient funds or daily transaction limit reached.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5">→</span>
              Card declined by the issuing bank.
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-0.5">→</span>
              Network timeout. Please check your internet connection.
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 w-full"
        >
          <button
            onClick={() => router.push("/checkout")}
            className="flex-1 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-900/30 hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-4 rounded-full border border-white/20 hover:border-white/40 text-white/60 hover:text-white font-bold uppercase tracking-widest transition-all"
          >
            Back to Store
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-white/20 text-xs"
        >
          If you continue to face issues, contact us at support@mangomamaji.com
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function OrderFailed() {
  return (
    <Suspense fallback={null}>
      <OrderFailedContent />
    </Suspense>
  );
}

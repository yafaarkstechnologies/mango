"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Temporary simple authentication as requested
    // In a real production app, this should be a server action or API call
    if (password === "mango2026") {
      document.cookie = "admin_session=true; path=/";
      router.push("/admin");
    } else {
      setError("Unauthorized access. Check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#021a02] text-white font-sans selection:bg-yellow-500/30 flex items-center justify-center p-6">
      <Navbar />
      
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/30 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-center">Admin Access</h1>
            <p className="text-white/40 text-sm mt-2">Enter your legacy key to proceed</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-4">Access Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all duration-300 placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-[0.2em] shadow-xl shadow-yellow-900/20 transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? "Verifying..." : "Authorize Access"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Mango Mamaji Control Suite v2.0</p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

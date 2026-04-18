"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginAdmin } from "@/app/actions/admin-auth";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await loginAdmin(password);

    if (result.success) {
      router.push("/admin");
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#021a02] text-zinc-900 flex items-center justify-center p-6 selection:bg-yellow-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-gradient-to-tl from-green-500/10 to-transparent rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-amber-600 uppercase">
            Mango G Admin
          </h1>
          <p className="text-zinc-500 text-sm tracking-widest uppercase font-bold">Basic Access Protection</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white shadow-sm border-zinc-200 border border-zinc-200 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 ml-2">Enter Secret Pin</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white shadow-sm border-zinc-200 border border-zinc-200 rounded-2xl px-6 py-4 text-zinc-900 text-center text-xl tracking-[0.5em] focus:outline-none focus:border-amber-400 transition-all font-mono"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-bold">
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full py-5 bg-zinc-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-800 transition-all shadow-xl shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify & Enter"}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-zinc-400 text-xs uppercase tracking-widest font-bold">
          Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
}

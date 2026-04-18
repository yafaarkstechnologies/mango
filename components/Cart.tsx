"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function Cart() {
  const router = useRouter();
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    total 
  } = useCart();

  return (
    <>
      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        {items.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full text-black text-xs font-bold flex items-center justify-center shadow-lg">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
        )}
      </button>

      {/* Cart Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white border-l border-zinc-200 z-50 flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="p-8 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase">Your Basket</h2>
                    <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-50"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            <p className="font-light tracking-wide text-lg text-center">Your harvest basket is empty.</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-6 items-center group relative p-4 rounded-xl hover:bg-zinc-50 transition-colors">
                                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl flex items-center justify-center border border-amber-200 flex-shrink-0 relative overflow-hidden">
                                   <div className="absolute inset-0 bg-yellow-500/5 blur-xl"></div>
                                   <Image src="/logo.png" alt="Mango" width={48} height={48} className="opacity-60 blur-[0.5px] z-10 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]"/>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl text-zinc-900 font-bold">{item.name}</h3>
                                    <p className="text-amber-600 font-mono text-sm mb-4">₹{item.price.toFixed(2)}</p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 bg-white border border-zinc-200 shadow-sm rounded-full px-4 py-1.5">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="text-zinc-500 hover:text-zinc-900 transition-colors">-</button>
                                            <span className="text-sm font-mono text-zinc-900 w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="text-zinc-500 hover:text-zinc-900 transition-colors">+</button>
                                        </div>
                                        <button 
                                          onClick={() => removeFromCart(item.id)} 
                                          className="text-red-500/60 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-zinc-200 bg-white relative shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-zinc-500 uppercase tracking-widest text-sm font-bold">Subtotal</span>
                        <span className="text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">₹{total.toFixed(2)}</span>
                    </div>
                    <button 
                        disabled={items.length === 0}
                        onClick={() => {
                          setIsCartOpen(false);
                          router.push('/checkout');
                        }}
                        className="relative group w-full py-5 rounded-full bg-zinc-900 text-white font-extrabold uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                        <span className="relative z-10 transition-colors group-hover:text-zinc-900">Proceed to Checkout</span>
                        <div className="absolute inset-0 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out bg-yellow-500"></div>
                    </button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

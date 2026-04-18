"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "success" | "verifying">("loading");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchOrder = async () => {
      // 1. Try fetching by order_id first
      if (orderId) {
        const { data } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .single();
        if (data) {
          setOrder(data);
          setStatus("success");
          return true;
        }
      }

      // 2. Try fetching by payment_id
      if (paymentId) {
        const { data } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("payment_id", paymentId)
          .single();
        if (data) {
          setOrder(data);
          setStatus("success");
          return true;
        }
      }
      return false;
    };

    if (orderId || paymentId) {
      fetchOrder().then((found) => {
        if (!found && paymentId) {
          setStatus("verifying");
          // Poll every 2 seconds for up to 10 seconds
          let attempts = 0;
          interval = setInterval(async () => {
            attempts++;
            const foundNow = await fetchOrder();
            if (foundNow || attempts >= 5) {
              clearInterval(interval);
              if (!foundNow) setStatus("success"); // Just show the generic success if still not found
            }
          }, 2000);
        } else if (found) {
          setStatus("success");
        }
      });
    }

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, paymentId]);

  return (
    <div className="min-h-screen bg-[#021a02] text-white flex flex-col items-center justify-center px-6 py-24 selection:bg-yellow-500/30">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
        className="relative z-10 max-w-lg w-full flex flex-col items-center text-center"
      >
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="relative w-32 h-32 mb-10"
        >
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
          <div className="w-32 h-32 rounded-full border-2 border-green-500/30 bg-green-500/10 flex items-center justify-center">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M20 6 9 17l-5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              />
            </motion.svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 mb-10"
        >
          <span className="text-yellow-500 text-xs font-black uppercase tracking-[0.4em]">Order Confirmed</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-green-400">
            Aapka Swagat Hai!
          </h1>
          <p className="text-xl text-white/50 font-light">
            Your mango box is packed with love. Mamaji will deliver it right to your door! 🥭
          </p>
        </motion.div>

        {order && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 text-left space-y-5"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Customer</p>
              <p className="text-lg font-bold">{order.customer_name}</p>
              <p className="text-white/40 text-sm">{order.customer_email}</p>
            </div>
            <div className="border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-widest text-white/30 mb-3">Items Ordered</p>
              <div className="space-y-2">
                {order.order_items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/70">{item.product_name} × {item.quantity}</span>
                    <span className="font-mono text-yellow-500/80">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-5 flex justify-between items-center">
              <span className="font-bold text-lg">Total Paid</span>
              <span className="text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-500">
                ₹{Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 w-full"
        >
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-4 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-900/30 hover:scale-105 active:scale-95"
          >
            Back to Store
          </button>
          {orderId && (
            <button
              onClick={() => router.push(`/invoice?order_id=${orderId}`)}
              className="flex-1 py-4 rounded-full border border-white/20 hover:border-white/40 text-white/60 hover:text-white font-bold uppercase tracking-widest transition-all"
            >
              View Invoice
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#021a02]" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

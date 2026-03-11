"use client";

import { useCart } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [shippingRate, setShippingRate] = useState<number>(45);
  const [shippingLoading, setShippingLoading] = useState(true);

  // Fetch active batch and shipping rate on load
  useEffect(() => {
    async function fetchActiveBatch() {
      const { data, error } = await supabase
        .from('batches')
        .select('id')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error && data) {
        setActiveBatchId(data.id);
      }
    }

    async function fetchShippingRate() {
      setShippingLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'shipping_rate')
        .single();
      
      if (!error && data && data.value) {
        const parsed = parseFloat(data.value);
        if (!isNaN(parsed)) setShippingRate(parsed);
      }
      setShippingLoading(false);
    }

    fetchActiveBatch();
    fetchShippingRate();
  }, []);


  // Redirect to home if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items, router]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDisplayRazorpay = async () => {
    setIsProcessing(true);
    const res = await loadRazorpay();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    // Generate a fallback order ID in case of DB issues
    const mockOrderId = "order_" + Math.random().toString(36).substring(2, 15);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round((total + shippingRate) * 100),
      currency: "INR",
      name: "Mango Mamaji",
      description: "Harvest 2026 Pre-order",
      // order_id is intentionally omitted for test mode (no server-side order creation)
      handler: async function (response: any) {
        try {
            const paymentId = response.razorpay_payment_id || `test_${Date.now()}`;
            
            // 1. Create the order in Supabase
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone || "N/A",
                    address: formData.address,
                    city: formData.city,
                    zip: formData.zip,
                    total_amount: total + shippingRate,
                    payment_id: paymentId,
                    status: 'paid',
                    batch_id: activeBatchId || null
                })
                .select()
                .single();

            if (orderError) {
              console.error("❌ Order insert error:", orderError);
              throw orderError;
            }
            console.log("✅ Order inserted:", order.id);

            // 2. Create the order items in Supabase
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
              console.error("❌ Order items insert error:", itemsError);
              throw itemsError;
            }
            console.log("✅ Order items inserted. Redirecting to success...");

            // 3. Clear cart and redirect to success
            clearCart();
            router.push(`/order-success?order_id=${order.id}`);
        } catch (error: any) {
            console.error("💥 Order processing failed:", error);
            alert(`Order saved failed: ${error?.message || "Unknown error"}. Payment ID: ${response.razorpay_payment_id || "N/A"}`);
            clearCart();
            router.push(`/order-success?order_id=${mockOrderId}&payment_id=${response.razorpay_payment_id || "N/A"}`);
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        address: formData.address,
      },
      theme: {
        color: "#22c55e",
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
          router.push("/order-failed?reason=Payment+was+cancelled");
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response: any) {
      setIsProcessing(false);
      router.push(`/order-failed?reason=${encodeURIComponent(response.error.description || 'Unknown error')}`);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleDisplayRazorpay();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#021a02] text-white pt-24 pb-32 selection:bg-yellow-500/30">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left Column - Form */}
        <div>
          <button onClick={() => router.back()} className="text-white/50 hover:text-white flex items-center gap-2 mb-12 transition-colors uppercase tracking-widest text-xs font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Return to Store
          </button>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-green-100">
            Secure Checkout
          </h1>
          <p className="text-white/40 mb-12">Please provide your details for the 2026 harvest delivery.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-white/50">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-colors" placeholder="Reginald Mamaji" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-white/50">Phone</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-colors" placeholder="+1 (555) 123-4567" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-white/50">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-colors" placeholder="reginald@example.com" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-white/50">Shipping Address</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-colors" placeholder="123 Orchard Lane, Suite 4B" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-white/50">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-colors" placeholder="Mumbai" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-white/50">Postal Code</label>
                <input required type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-colors" placeholder="400001" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-5 mt-8 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-lg uppercase tracking-[0.2em] shadow-lg shadow-yellow-900/40 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {isProcessing ? "Processing..." : "Pay via Razorpay"}
            </button>
            <p className="text-center text-white/30 text-xs mt-4 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="rect x='3' y='11' width='18' height='11' rx='2' ry='2'" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Secured by Razorpay. 100% Buyer Protection.
            </p>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-yellow-500/80">Order Summary</h2>

          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-yellow-500/10 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0">
                  <Image src="/logo.png" alt="Mango" width={32} height={32} className="opacity-50 blur-[0.5px]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{item.name}</h3>
                  <p className="text-white/40 text-sm">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-yellow-100">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 space-y-4">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span className="font-mono">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>International Shipping</span>
              {shippingLoading ? (
                <span className="font-mono bg-white/10 animate-pulse rounded w-16 h-5 inline-block" />
              ) : (
                <span className="font-mono">₹{shippingRate.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between text-white/60">
              <span>Taxes</span>
              <span className="font-mono">Included</span>
            </div>

            <div className="border-t border-white/10 mt-6 pt-6 flex justify-between items-center">
              <span className="text-xl font-bold">Total</span>
              {shippingLoading ? (
                <span className="h-9 w-32 bg-white/10 animate-pulse rounded-xl inline-block" />
              ) : (
                <span className="text-3xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-500">
                  ₹{(total + shippingRate).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

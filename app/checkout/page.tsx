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
    flat_no: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    zip: "",
  });
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [shippingRate, setShippingRate] = useState<number>(45);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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


  // Redirect to home if cart is empty (only after mount to avoid flash)
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/");
    }
  }, [items, router, mounted]);

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
        // Clear cart and redirect to success immediately
        // The webhook handles order creation in the background
        clearCart();
        router.push(`/order-success?payment_id=${response.razorpay_payment_id}&verifying=true`);
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        flat_no: formData.flat_no,
        address_line_1: formData.address_line_1,
        address_line_2: formData.address_line_2,
        city: formData.city,
        zip: formData.zip,
        batch_id: activeBatchId || "",
        items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })))
      },
      theme: {
        color: "#FACC15",
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false);
          router.push("/order-failed?reason=Payment+was+cancelled");
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    
    // Explicitly handle modal closure if the ondismiss in options fails
    paymentObject.on('modal.closed', () => {
      setIsProcessing(false);
      router.push("/order-failed?reason=Payment+was+cancelled");
    });

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
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 pt-24 pb-32 selection:bg-yellow-500/30">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Left Column - Form */}
        <div>
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-900 flex items-center gap-2 mb-12 transition-colors uppercase tracking-widest text-xs font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Return to Store
          </button>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-zinc-900">
            Secure Checkout
          </h1>
          <p className="text-zinc-500 mb-12">Please provide your details for the 2026 harvest delivery.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="Reginald Mamaji" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Phone</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="+1 (555) 123-4567" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-white/50">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="reginald@example.com" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Flat / House No</label>
                <input required type="text" name="flat_no" value={formData.flat_no} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="4B" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Address Line 1</label>
                <input required type="text" name="address_line_1" value={formData.address_line_1} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="Orchard Lane, Palm Grove" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-widest text-white/50">Address Line 2 (Optional)</label>
              <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="Near Green Valley Park" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-zinc-500">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="Mumbai" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Postal Code</label>
                <input required type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:bg-zinc-50 transition-colors placeholder:text-zinc-300 text-zinc-900" placeholder="400001" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-5 mt-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-lg uppercase tracking-[0.2em] shadow-lg transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              {isProcessing ? "Processing..." : "Pay via Razorpay"}
            </button>
            <p className="text-center text-zinc-400 text-xs mt-4 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="rect x='3' y='11' width='18' height='11' rx='2' ry='2'" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Secured by Razorpay. 100% Buyer Protection.
            </p>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-8 lg:p-12 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-8 uppercase tracking-widest text-zinc-900">Order Summary</h2>

          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg flex items-center justify-center border border-amber-100 flex-shrink-0">
                  <Image src="/logo.png" alt="Mango" width={32} height={32} className="opacity-50 blur-[0.5px]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-zinc-900 font-semibold">{item.name}</h3>
                  <p className="text-zinc-500 text-sm">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-amber-600 font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-200 pt-6 space-y-4">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-mono">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Delivery Charges</span>
              {shippingLoading ? (
                <span className="font-mono bg-zinc-200 animate-pulse rounded w-16 h-5 inline-block" />
              ) : (
                <span className="font-mono">₹{shippingRate.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Taxes</span>
              <span className="font-mono">Included</span>
            </div>

            <div className="border-t border-zinc-200 mt-6 pt-6 flex justify-between items-center text-zinc-900">
              <span className="text-xl font-bold">Total</span>
              {shippingLoading ? (
                <span className="h-9 w-32 bg-zinc-200 animate-pulse rounded-xl inline-block" />
              ) : (
                <span className="text-3xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">
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

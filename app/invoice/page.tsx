import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const orderId = searchParams.order_id as string;
  
  if (!orderId) {
      return (
          <div className="min-h-screen bg-[#021a02] text-white flex items-center justify-center p-6 selection:bg-yellow-500/30">
              <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
                  <Link href="/" className="text-yellow-500 hover:underline">Return to Store</Link>
              </div>
          </div>
      );
  }

  // Fetch real order data from the new Supabase project
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return (
        <div className="min-h-screen bg-[#021a02] text-white flex items-center justify-center p-6 text-center">
            <div>
                <h1 className="text-2xl font-bold mb-2">Order Reference Missing</h1>
                <p className="text-white/40 mb-8">We found no record for ID: {orderId}</p>
                <Link href="/" className="text-yellow-500 hover:underline">Back to Storefront</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#021a02] text-white flex items-center justify-center p-6 selection:bg-yellow-500/30">
      <div className="max-w-3xl w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-16 relative overflow-hidden backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-500/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-500/20 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
            
          <div className="w-24 h-24 bg-gradient-to-br from-green-500/10 to-yellow-500/10 rounded-full flex items-center justify-center border border-white/10 mb-8 relative">
             <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
             <Image src="/logo.png" alt="Success Logo" width={48} height={48} className="drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Payment Successful
          </h1>
          
          <p className="text-white/40 text-lg mb-12 max-w-lg">
            Thank you, {order.customer_name}. Your 2026 harvest pre-order has been secured and logged in our dynasty records.
          </p>

          {/* Invoice Details */}
          <div className="w-full bg-black/40 border border-white/5 rounded-2xl p-8 mb-12 backdrop-blur-sm text-left">
            <h2 className="text-yellow-500 uppercase tracking-[0.2em] text-xs font-bold mb-6 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-yellow-500/30" />
              Order Summary
            </h2>

            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b border-white/5 pb-8">
               <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-mono text-white/90 text-[10px] md:text-xs">{order.id}</p>
               </div>
               <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Date</p>
                  <p className="font-mono text-white/90">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
               </div>
               <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Status</p>
                  <p className="text-green-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {order.status.toUpperCase()}
                  </p>
               </div>
            </div>

            <div className="space-y-4 mb-8">
                {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-white/60">
                            {item.product_name} <span className="text-white/30 ml-2">x{item.quantity}</span>
                        </span>
                        <span className="font-mono text-yellow-100">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-white/5 pt-6 flex justify-between items-center">
               <span className="text-white/60 text-lg">Total Paid</span>
               <span className="text-3xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-500">
                  ₹{order.total_amount.toFixed(2)}
               </span>
            </div>
          </div>

          <Link href="/" className="inline-block px-12 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors uppercase tracking-[0.2em] font-bold text-sm text-white/80 hover:text-white group">
             <span className="flex items-center gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
               Return to Experience
             </span>
          </Link>
          
        </div>
      </div>
    </div>
  );
}

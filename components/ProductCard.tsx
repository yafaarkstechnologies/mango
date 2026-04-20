"use client";

import Image from "next/image";
import { useCart } from "@/lib/store";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
  image_placeholder: string;
  stock_quantity?: number;
  track_inventory?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = (product.track_inventory && product.stock_quantity !== undefined && product.stock_quantity <= 0);

  return (
    <div className={`group relative rounded-3xl border border-zinc-200 bg-white p-8 transition-all duration-700 flex flex-col cursor-pointer overflow-hidden backdrop-blur-sm shadow-sm ${isOutOfStock ? 'opacity-60 saturate-50' : 'hover:border-zinc-300 hover:shadow-md'} ${className}`}>
      <div className={`absolute -top-12 -right-12 w-48 h-48 ${isOutOfStock ? 'bg-zinc-100' : 'bg-yellow-500/10'} rounded-full blur-[80px] transition-all duration-700`} />

      {isOutOfStock && (
        <div className="absolute top-8 right-8 z-20 px-4 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40">
          Sold Out
        </div>
      )}

      <div className="w-full aspect-square rounded-2xl bg-zinc-50 mb-8 flex items-center justify-center border border-zinc-100 relative overflow-hidden">
        {product.image_placeholder ? (
          <Image
            src={product.image_placeholder}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-500/10" />
            <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest z-10">{product.category}</span>
          </>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      <h3 className="text-3xl font-black mb-3 tracking-tighter uppercase text-zinc-900">{product.name}</h3>
      <p className="text-zinc-600 text-base mb-8 flex-grow leading-relaxed font-light">{product.description}</p>

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">10 pcs</span>
            <span className="font-mono text-2xl font-light text-amber-600">₹{Number(product.price).toFixed(2)}</span>
          </div>
          <button
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && addToCart({ 
              id: product.id, 
              name: product.name, 
              price: Number(product.price),
              image: product.image_placeholder || undefined
            })}
            className={`px-6 py-2.5 md:px-8 md:py-3 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${isOutOfStock
              ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
              : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-900/10 hover:shadow-yellow-500/30 hover:scale-105 active:scale-95'
              }`}
          >
            {isOutOfStock ? "Out of Stock" : (product.name.includes("Royale") ? "Pre-order" : "Buy Now")}
            {!isOutOfStock && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /><path d="M5 12h14" /></svg>}
          </button>
        </div>

        {/* WhatsApp Alternative Ordering */}
        <a
          href={`https://wa.me/918976066914?text=Hi%20Mango%20Mango G!%20I'd%20like%20to%20order%20${encodeURIComponent(product.name)}.%20Please%20guide%20me%20on%20the%20next%20steps.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 md:py-3 rounded-2xl border border-zinc-200 flex items-center justify-center gap-3 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold group/wa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/wa:text-green-600 transition-colors"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}

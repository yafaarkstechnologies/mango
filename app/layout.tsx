import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mango G | The 2026 Harvest",
  description: "Curated, hand-picked premium mangoes straight from the ancestral farms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} font-sans bg-[#fafafa] text-zinc-900 overflow-x-hidden selection:bg-yellow-500/30`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

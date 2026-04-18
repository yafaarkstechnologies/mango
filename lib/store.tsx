"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mango_cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Sanitize: only keep items with a valid id and numeric price
          setItems(parsed.filter(item => item && item.id && typeof item.price === 'number'));
        }
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("mango_cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    // Basic validation
    if (!newItem || !newItem.id || typeof newItem.price !== 'number') return;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.reduce<CartItem[]>((acc, item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          if (newQuantity > 0) acc.push({ ...item, quantity: newQuantity });
          // If newQuantity <= 0, item is dropped (removed from cart)
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/utils";
import { cartTotals } from "@/lib/utils";

const STORAGE = "pathra-cart-v1";

type CartContextValue = {
  items: CartLine[];
  count: number;
  totals: ReturnType<typeof cartTotals>;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toast: string;
  showToast: (msg: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string | null;
}) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!userId || !ready) return;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length) setItems(data.items);
      })
      .catch(() => {});
  }, [userId, ready]);

  useEffect(() => {
    if (!userId || !ready) return;
    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch(() => {});
  }, [items, userId, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  const add = useCallback(
    (line: Omit<CartLine, "qty">, qty = 1) => {
      const q = Math.max(1, qty);
      setItems((prev) => {
        const found = prev.find((i) => i.key === line.key);
        if (found) return prev.map((i) => (i.key === line.key ? { ...i, qty: i.qty + q } : i));
        return [...prev, { ...line, qty: q }];
      });
      showToast(`✅ ${line.name} added to cart`);
    },
    [showToast]
  );

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.key !== key);
      return prev.map((i) => (i.key === key ? { ...i, qty } : i));
    });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => cartTotals(items), [items]);
  const count = totals.count;

  const value = useMemo(
    () => ({ items, count, totals, add, setQty, remove, clear, toast, showToast }),
    [items, count, totals, add, setQty, remove, clear, toast, showToast]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

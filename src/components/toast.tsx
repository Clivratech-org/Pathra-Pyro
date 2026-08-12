"use client";

import { useCart } from "./cart-provider";

export function Toast() {
  const { toast } = useCart();
  return <div className={`toast${toast ? " show" : ""}`}>{toast || "✅ Added to cart"}</div>;
}

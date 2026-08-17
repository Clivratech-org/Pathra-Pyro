"use client";

import { useCart } from "./cart-provider";

export function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className="toast show" role="status" aria-live="polite">
      {toast}
    </div>
  );
}

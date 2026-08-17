"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";

type ProductPayload = {
  kind: "product";
  name: string;
  qty?: number;
  sale?: number;
};

type CartPayload = {
  kind: "cart";
};

export function EnquireButton({
  payload,
  className,
  children,
}: {
  payload: ProductPayload | CartPayload;
  className?: string;
  children: React.ReactNode;
}) {
  const { requireLogin, items } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onClick() {
    setErr("");
    if (!requireLogin()) return;
    if (payload.kind === "cart" && !items.length) {
      setErr("Add items to your cart first.");
      return;
    }
    setBusy(true);
    const body =
      payload.kind === "cart"
        ? {
            kind: "cart",
            items: items.map((i) => ({ name: i.name, qty: i.qty, sale: i.sale, mrp: i.mrp, cat: i.cat })),
          }
        : payload;
    const res = await fetch("/api/enquire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (res.status === 401) {
      requireLogin();
      return;
    }
    if (!res.ok || !data.url) {
      setErr(data.error || "Could not start enquiry.");
      return;
    }
    window.open(data.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div style={{ marginTop: 12, width: "100%" }}>
      <button type="button" className={className} onClick={onClick} disabled={busy}>
        {busy ? "Opening…" : children}
      </button>
      {err && <p className="alert error" style={{ marginTop: 8 }}>{err}</p>}
    </div>
  );
}

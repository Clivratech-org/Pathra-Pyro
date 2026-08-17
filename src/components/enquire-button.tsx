"use client";

import { useState } from "react";
import Link from "next/link";
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
  const { requireLogin, items, showToast } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function onClick() {
    setErr("");
    setOk("");
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
      setErr(data.error || "Could not send enquiry.");
      return;
    }

    const msg = data.message || "Enquiry saved! Our team will contact you soon.";
    setOk(msg);
    showToast(`✅ ${msg}`);

    const popup = window.open(data.url, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = data.url;
    }
  }

  return (
    <div style={{ marginTop: 12, width: "100%" }}>
      <button type="button" className={className} onClick={onClick} disabled={busy}>
        {busy ? "Sending…" : children}
      </button>
      {ok && (
        <p className="alert ok" style={{ marginTop: 8 }}>
          {ok}{" "}
          <Link href="/account/enquiries" style={{ color: "inherit", textDecoration: "underline" }}>
            View my enquiries
          </Link>
        </p>
      )}
      {err && <p className="alert error" style={{ marginTop: 8 }}>{err}</p>}
    </div>
  );
}

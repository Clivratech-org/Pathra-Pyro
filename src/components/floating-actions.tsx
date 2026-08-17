"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";
import { waLink } from "@/lib/utils";

export function FloatingActions({ phone, whatsapp }: { phone: string; whatsapp: string }) {
  const { count } = useCart();
  return (
    <>
      <Link href="/quick-order" className="quick-order-fab">
        ⚡ QUICK ORDER
      </Link>
      <div className="float-btns">
        <Link href="/cart" className="fab cart-fab desktop-only-fab" aria-label="Cart">
          🛒
          {count > 0 && <span className="cart-count">{count}</span>}
        </Link>
        <a className="fab call" href={`tel:${phone.replace(/\s/g, "")}`} aria-label="Call">
          📞
        </a>
        <a
          className="fab wa"
          href={waLink(whatsapp, "Hi, I want to order crackers")}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          <span className="ping" />
          💬
        </a>
      </div>
    </>
  );
}

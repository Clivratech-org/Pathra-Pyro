"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { discountPct, formatInr, mediaUrl } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  cat: string;
  mrp: number;
  sale: number;
  img: string;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const disc = discountPct(p.mrp, p.sale);

  function onAdd() {
    add(
      {
        key: `product:${p.id}`,
        kind: "product",
        id: p.id,
        name: p.name,
        cat: p.cat,
        mrp: p.mrp,
        sale: p.sale,
        img: p.img,
        slug: p.slug,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="card product-card">
      <Link href={`/product/${p.slug}`} className="imgwrap">
        <img src={mediaUrl(p.img)} alt={p.name} />
        {disc > 0 && <div className="off-badge">{disc}% OFF</div>}
      </Link>
      <div className="body">
        <div className="cat">{p.cat}</div>
        <Link href={`/product/${p.slug}`}>
          <h4>{p.name}</h4>
        </Link>
        <div className="price-row">
          <span className="old">{formatInr(p.mrp)}</span>
          <span className="new">{formatInr(p.sale)}</span>
        </div>
        <div className="qty-row">
          <div className="qty-selector">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
            <span className="val">{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase">+</button>
          </div>
          <button className={`add-cart-btn${added ? " added" : ""}`} type="button" onClick={onAdd}>
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

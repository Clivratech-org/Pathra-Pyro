"use client";

import { useCart } from "./cart-provider";
import { formatInr, mediaUrl } from "@/lib/utils";

export type ComboData = {
  id: string;
  slug: string;
  tier: string;
  name: string;
  items: string[];
  mrp: number;
  sale: number;
  img?: string | null;
};

export function ComboCard({ c }: { c: ComboData }) {
  const { add } = useCart();
  const savePct = Math.round((1 - c.sale / c.mrp) * 100);

  return (
    <div className="card combo-card">
      <div className="tier">{c.tier}</div>
      <h3>{c.name}</h3>
      <ul>
        {c.items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <div className="combo-price">
        <span className="old">{formatInr(c.mrp)}</span>
        <span className="new">{formatInr(c.sale)}</span>
      </div>
      <span className="save">You save {savePct}%</span>
      <button
        className="btn btn-primary btn-block"
        type="button"
        onClick={() =>
          add({
            key: `combo:${c.id}`,
            kind: "combo",
            id: c.id,
            name: c.name,
            cat: "Combo Pack",
            mrp: c.mrp,
            sale: c.sale,
            img: mediaUrl(c.img),
            slug: c.slug,
          })
        }
      >
        Add Pack to Cart
      </button>
    </div>
  );
}

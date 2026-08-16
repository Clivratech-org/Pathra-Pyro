"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { discountPct, formatInr, mediaUrl, stockStatus } from "@/lib/utils";
import { ProductCard, type ProductCardData } from "@/components/product-card";

type Img = { path: string; alt: string };

export function ProductDetail({
  product,
  related,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    cat: string;
    mrp: number;
    sale: number;
    stock: number;
    images: Img[];
  };
  related: ProductCardData[];
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [idx, setIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const cover = product.images[idx] || product.images[0];
  const disc = discountPct(product.mrp, product.sale);
  const stock = stockStatus(product.stock);

  function onAdd() {
    if (product.stock <= 0) return;
    add(
      {
        key: `product:${product.id}`,
        kind: "product",
        id: product.id,
        name: product.name,
        cat: product.cat,
        mrp: product.mrp,
        sale: product.sale,
        img: cover?.path || "",
        slug: product.slug,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <div className="crumb">
            Home / Shop / <span>{product.name}</span>
          </div>
        </div>
      </div>
      <section style={{ paddingTop: 40 }}>
        <div className="wrap pdp-grid">
          <div className="pdp-gallery">
            <div className="main">
              <img src={mediaUrl(cover?.path)} alt={cover?.alt || product.name} />
            </div>
            <div className="pdp-thumbs">
              {product.images.map((img, i) => (
                <button key={`${img.path}-${i}`} type="button" className={i === idx ? "active" : ""} onClick={() => setIdx(i)}>
                  <img src={mediaUrl(img.path)} alt={img.alt} />
                </button>
              ))}
            </div>
          </div>
          <div className="pdp-info">
            <div className="cat">{product.cat}</div>
            <h1>{product.name}</h1>
            {disc > 0 && <span className="off-badge" style={{ position: "static", display: "inline-block" }}>{disc}% OFF</span>}
            <div className="price-row" style={{ marginTop: 16 }}>
              <span className="old">{formatInr(product.mrp)}</span>
              <span className="new" style={{ fontSize: "1.8rem" }}>{formatInr(product.sale)}</span>
            </div>
            <span className={`stock-pill ${stock.key}`}>{stock.label}</span>
            <p className="desc">{product.description}</p>
            <div className="qty-row" style={{ maxWidth: 420 }}>
              <div className="qty-selector">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="val">{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              <button className={`add-cart-btn${added ? " added" : ""}`} disabled={product.stock <= 0} onClick={onAdd}>
                {product.stock <= 0 ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section>
          <div className="wrap">
            <div className="section-head">
              <div className="eyebrow">More in {product.cat}</div>
              <h2>Related Products</h2>
            </div>
            <div className="grid-4">
              {related.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

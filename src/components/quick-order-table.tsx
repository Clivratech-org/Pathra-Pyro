"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatInr, mediaUrl } from "@/lib/utils";
import type { ProductCardData } from "@/components/product-card";

export function QuickOrderTable({
  products,
  categories,
}: {
  products: ProductCardData[];
  categories: string[];
}) {
  const { add, showToast } = useCart();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [qty, setQty] = useState<Record<string, number>>({});

  const list = useMemo(
    () =>
      products.filter(
        (p) => (cat === "All" || p.cat === cat) && p.name.toLowerCase().includes(q.toLowerCase())
      ),
    [products, cat, q]
  );

  const summary = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    let orig = 0;
    for (const p of products) {
      const n = qty[p.id] || 0;
      if (n <= 0) continue;
      count += n;
      subtotal += n * p.sale;
      orig += n * p.mrp;
    }
    return { count, subtotal, savings: orig - subtotal };
  }, [products, qty]);

  function pushToCart() {
    let any = false;
    for (const p of products) {
      const n = qty[p.id] || 0;
      if (n <= 0) continue;
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
        n
      );
      any = true;
    }
    if (any) {
      setQty({});
      window.location.href = "/cart";
    } else {
      showToast("⚠️ Please add quantity to at least one item");
    }
  }

  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <div className="crumb">Home / <span>Quick Order</span></div>
          <div className="eyebrow">Fast Checkout</div>
          <h1>Quick Order — All Products, One List</h1>
          <p>Skip browsing category by category. Search, set quantities, and submit your whole order in minutes.</p>
        </div>
      </div>
      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="qo-toolbar">
            <div className="search-box" style={{ maxWidth: 340 }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all products..." />
            </div>
            <div className="qo-cats">
              {["All", ...categories].map((c) => (
                <button key={c} className={`chip${c === cat ? " active" : ""}`} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="qo-layout">
            <div className="card static" style={{ overflow: "auto" }}>
              <table className="qo-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => {
                    const n = qty[p.id] || 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="qo-row-name">
                            <img src={mediaUrl(p.img)} alt="" />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.cat}</td>
                        <td className="price-cell">{formatInr(p.sale)}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            className="qty-input"
                            value={n}
                            onChange={(e) => setQty((s) => ({ ...s, [p.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          />
                        </td>
                        <td className="price-cell">{formatInr(n * p.sale)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card summary-card">
              <h4>Order Summary</h4>
              <div className="summary-line">
                <span>{summary.count} items</span>
                <span className="amt">{formatInr(summary.subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Est. Discount Applied</span>
                <span className="amt">{formatInr(summary.savings)}</span>
              </div>
              <div className="summary-line total">
                <span>Grand Total</span>
                <span className="amt">{formatInr(summary.subtotal)}</span>
              </div>
              <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={pushToCart}>
                Order Now → Go to Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

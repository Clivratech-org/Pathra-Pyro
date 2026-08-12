"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatInr, mediaUrl } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, remove, totals } = useCart();

  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <div className="crumb">Home / <span>Cart</span></div>
          <div className="eyebrow">Review & Confirm</div>
          <h1>Your Cart</h1>
          <p>Review quantities, then continue to secure Razorpay checkout. Guest checkout is available.</p>
        </div>
      </div>
      <section style={{ paddingTop: 40 }}>
        <div className="wrap cart-layout">
          <div className="card static" id="cartItemsBox">
            {items.length === 0 ? (
              <div className="empty-cart">
                <div className="emoji">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Browse our shop and add some sparkle to your Diwali!</p>
                <Link className="btn btn-primary" style={{ marginTop: 20 }} href="/shop">Start Shopping</Link>
              </div>
            ) : (
              items.map((c) => (
                <div className="cart-item" key={c.key}>
                  <img src={mediaUrl(c.img)} alt="" />
                  <div>
                    <div className="cat">{c.cat}</div>
                    <h5>{c.name}</h5>
                    <div className="price">
                      {formatInr(c.sale)} × {c.qty} = {formatInr(c.sale * c.qty)}
                    </div>
                  </div>
                  <div className="qty-selector">
                    <button onClick={() => setQty(c.key, c.qty - 1)}>−</button>
                    <span className="val">{c.qty}</span>
                    <button onClick={() => setQty(c.key, c.qty + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => remove(c.key)}>✕</button>
                </div>
              ))
            )}
          </div>
          <div>
            <div className="card summary-card">
              <h4>Cart Total</h4>
              <div className="summary-line">
                <span>{totals.count} items</span>
                <span className="amt">{formatInr(totals.subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>You Save</span>
                <span className="amt">{formatInr(totals.savings)}</span>
              </div>
              <div className="summary-line total">
                <span>Grand Total</span>
                <span className="amt">{formatInr(totals.subtotal)}</span>
              </div>
              <Link
                className={`btn btn-primary btn-block${items.length === 0 ? "" : ""}`}
                href="/checkout"
                style={{ marginTop: 18, pointerEvents: items.length === 0 ? "none" : "auto", opacity: items.length === 0 ? 0.5 : 1 }}
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

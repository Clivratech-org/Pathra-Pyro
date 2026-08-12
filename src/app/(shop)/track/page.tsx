"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackPage() {
  const router = useRouter();
  const [err, setErr] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = String(fd.get("order") || "").trim().toUpperCase();
    const phone = String(fd.get("phone") || "").replace(/\D/g, "");
    if (!id || phone.length < 10) {
      setErr("Enter a valid order ID and 10-digit phone.");
      return;
    }
    router.push(`/track/${id}?phone=${phone.slice(-10)}`);
  }

  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <div className="crumb">Home / <span>Track Order</span></div>
          <div className="eyebrow">Delivery Status</div>
          <h1>Track Your Order</h1>
          <p>Enter the order ID from your confirmation and the mobile number used at checkout.</p>
        </div>
      </div>
      <section>
        <div className="wrap track-lookup">
          <form className="card form-card static" onSubmit={onSubmit}>
            {err && <div className="alert error">{err}</div>}
            <div className="form-row">
              <div className="field">
                <label>Order ID</label>
                <input name="order" required placeholder="SPW1001" />
              </div>
              <div className="field">
                <label>Mobile number</label>
                <input name="phone" required placeholder="10-digit mobile" />
              </div>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }}>Track</button>
          </form>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState } from "react";
import { saveOffer, deleteOffer } from "@/app/admin/actions";

type Offer = {
  id: string;
  title: string;
  pct: number;
  appliesTo: string;
  categoryId: string | null;
  startDate: string;
  endDate: string;
  status: string;
  usedPct: number;
  categoryName?: string | null;
};

export function OffersClient({
  offers,
  categories,
}: {
  offers: Offer[];
  categories: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState<Partial<Offer> | null>(null);

  return (
    <>
      <div className="toolbar">
        <span className="page-sub">Manage Diwali discount tiers & combo offers</span>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ New Offer</button>
      </div>
      <div className="offer-grid">
        {offers.map((o) => (
          <div className="card offer-card static" key={o.id}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="pct">{o.pct}%</div>
              <span className={`pill ${o.status}`}>{o.status}</span>
            </div>
            <h4>{o.title}</h4>
            <p>Applies to: {o.appliesTo === "CATEGORY" ? o.categoryName : o.appliesTo}</p>
            <div className="progress"><div className="fill" style={{ width: `${o.usedPct}%` }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontFamily: "var(--mono)", fontSize: "0.7rem", color: "var(--cream-dim)" }}>
              <span>{new Date(o.startDate).toLocaleDateString("en-IN")} → {new Date(o.endDate).toLocaleDateString("en-IN")}</span>
              <span>{o.usedPct}% used</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="icon-mini" onClick={() => setEditing(o)}>✎</button>
              <form action={deleteOffer.bind(null, o.id)}><button className="icon-mini">🗑</button></form>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="modal-overlay show" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }} onClick={() => setEditing(null)}>
          <form className="card form-card static" style={{ maxWidth: 480, width: "100%" }} action={saveOffer} onClick={(e) => e.stopPropagation()}>
            <h3>{editing.id ? "Edit Offer" : "Create Offer"}</h3>
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-row" style={{ marginTop: 12 }}>
              <div className="field"><label>Title</label><input name="title" required defaultValue={editing.title} /></div>
              <div className="form-row two">
                <div className="field"><label>Discount %</label><input type="number" name="pct" defaultValue={editing.pct || 40} /></div>
                <div className="field">
                  <label>Applies To</label>
                  <select name="appliesTo" defaultValue={editing.appliesTo || "ALL"}>
                    <option value="ALL">All Products</option>
                    <option value="COMBOS">Combo Packs</option>
                    <option value="CATEGORY">Category</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Category (if applicable)</label>
                <select name="categoryId" defaultValue={editing.categoryId || ""}>
                  <option value="">—</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-row two">
                <div className="field"><label>Start</label><input type="date" name="startDate" defaultValue={editing.startDate?.slice(0, 10)} /></div>
                <div className="field"><label>End</label><input type="date" name="endDate" defaultValue={editing.endDate?.slice(0, 10)} /></div>
              </div>
              <div className="field">
                <label>Status</label>
                <select name="status" defaultValue={editing.status || "active"}>
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                  <option value="expired">expired</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

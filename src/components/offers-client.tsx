"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOffer, deleteOffer } from "@/app/admin/actions";
import { useConfirm } from "@/components/confirm-dialog";
import { InlineSpinner } from "@/components/page-loader";

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
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState<Partial<Offer> | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [saving, startSave] = useTransition();
  const [pending, startTransition] = useTransition();

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2500);
  }

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startSave(async () => {
      const res = await saveOffer(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(null);
      flash(res.message || "Offer saved.");
      router.refresh();
    });
  }

  async function onDelete(o: Offer) {
    const ok = await confirm({
      title: "Delete offer?",
      message: `Delete “${o.title}”? This cannot be undone.`,
      confirmLabel: "Delete offer",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteOffer(o.id);
      flash(res.ok ? res.message || "Deleted." : res.error);
      router.refresh();
    });
  }

  return (
    <>
      {dialog}
      {toast && <div className="toast-banner ok">{toast}</div>}
      <div className="toolbar">
        <span className="page-sub">Manage Diwali discount tiers & combo offers</span>
        <button className="btn btn-primary" type="button" onClick={() => setEditing({})}>
          + New Offer
        </button>
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
            <div className="progress">
              <div className="fill" style={{ width: `${o.usedPct}%` }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 16,
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                color: "var(--cream-dim)",
              }}
            >
              <span>
                {new Date(o.startDate).toLocaleDateString("en-IN")} →{" "}
                {new Date(o.endDate).toLocaleDateString("en-IN")}
              </span>
              <span>{o.usedPct}% used</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="icon-mini" type="button" onClick={() => setEditing(o)}>
                ✎
              </button>
              <button
                className="icon-mini"
                type="button"
                disabled={pending}
                onClick={() => onDelete(o)}
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="modal-overlay show" onClick={() => !saving && setEditing(null)}>
          <form
            key={editing.id || "new"}
            className="card form-card static modal-panel"
            onSubmit={onSave}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editing.id ? "Edit Offer" : "Create Offer"}</h3>
            {error && <div className="alert error">{error}</div>}
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-stack">
              <div className="field">
                <label>Title</label>
                <input name="title" required defaultValue={editing.title || ""} />
              </div>
              <div className="form-row two">
                <div className="field">
                  <label>Discount %</label>
                  <input type="number" name="pct" defaultValue={editing.pct || 40} />
                </div>
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
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row two">
                <div className="field">
                  <label>Start</label>
                  <input type="date" name="startDate" defaultValue={editing.startDate?.slice(0, 10)} />
                </div>
                <div className="field">
                  <label>End</label>
                  <input type="date" name="endDate" defaultValue={editing.endDate?.slice(0, 10)} />
                </div>
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
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" disabled={saving} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? <InlineSpinner label="Saving…" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteLead, saveLead } from "@/app/admin/actions";
import { useConfirm } from "@/components/confirm-dialog";
import { InlineSpinner } from "@/components/page-loader";
import { waLink } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  phone: string;
  interest: string;
  source: string;
  status: string;
  notes: string;
  lastContact: string;
};

export function LeadsClient({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Partial<Lead> | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  const list = useMemo(
    () =>
      leads.filter(
        (l) =>
          (status === "all" || l.status === status) &&
          (l.name.toLowerCase().includes(q.toLowerCase()) || l.phone.includes(q))
      ),
    [leads, q, status]
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2500);
  }

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startSave(async () => {
      const res = await saveLead(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(null);
      flash(res.message || "Lead saved.");
      router.refresh();
    });
  }

  async function onDelete(id: string, name: string) {
    const ok = await confirm({
      title: "Delete lead?",
      message: `Remove “${name}” from lead management? This cannot be undone.`,
      confirmLabel: "Delete lead",
      danger: true,
    });
    if (!ok) return;
    startDelete(async () => {
      const res = await deleteLead(id);
      if (!res.ok) {
        flash(res.error);
        return;
      }
      flash(res.message || "Lead deleted.");
      router.refresh();
    });
  }

  return (
    <>
      {dialog}
      {toast && <div className="toast-banner ok">{toast}</div>}
      <div className="toolbar">
        <div className="search-box2">
          <input
            placeholder="Search leads by name or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="filters" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "new", "contacted", "converted", "lost"].map((s) => (
            <button
              key={s}
              type="button"
              className={`chip-f${status === s ? " active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setEditing({})}>
          + Add Lead
        </button>
      </div>
      <div className="card table-wrap static">
        <table className="data">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Interested In</th>
              <th>Source</th>
              <th>Status</th>
              <th>Last Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td>{l.phone}</td>
                <td>{l.interest}</td>
                <td>
                  <span className="cell-sub">{l.source}</span>
                </td>
                <td>
                  <span className={`pill ${l.status}`}>{l.status}</span>
                </td>
                <td>
                  <span className="cell-sub">{new Date(l.lastContact).toLocaleString("en-IN")}</span>
                </td>
                <td className="row-actions">
                  <a className="icon-mini" href={waLink(l.phone)} target="_blank" rel="noreferrer">
                    💬
                  </a>
                  <a className="icon-mini" href={`tel:${l.phone.replace(/\s/g, "")}`}>
                    📞
                  </a>
                  <button className="icon-mini" type="button" onClick={() => setEditing(l)} title="Edit">
                    ✎
                  </button>
                  <button
                    className="icon-mini"
                    type="button"
                    disabled={deleting}
                    onClick={() => onDelete(l.id, l.name)}
                    title="Delete"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="modal-overlay show" onClick={() => !saving && setEditing(null)}>
          <form
            key={editing.id || "new"}
            className="card form-card static modal-panel"
            onSubmit={onSave}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editing.id ? "Edit Lead" : "Add New Lead"}</h3>
            {error && <div className="alert error">{error}</div>}
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-stack">
              <div className="field">
                <label htmlFor="lead-name">Customer Name</label>
                <input id="lead-name" name="name" required defaultValue={editing.name || ""} autoComplete="name" />
              </div>
              <div className="form-row two">
                <div className="field">
                  <label htmlFor="lead-phone">Phone</label>
                  <input
                    id="lead-phone"
                    name="phone"
                    required
                    defaultValue={editing.phone || ""}
                    autoComplete="tel"
                  />
                </div>
                <div className="field">
                  <label htmlFor="lead-source">Source</label>
                  <select id="lead-source" name="source" defaultValue={editing.source || "WhatsApp"}>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Website Enquiry">Website Enquiry</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="lead-interest">Interested In</label>
                <input id="lead-interest" name="interest" defaultValue={editing.interest || ""} />
              </div>
              <div className="field">
                <label htmlFor="lead-status">Status</label>
                <select id="lead-status" name="status" defaultValue={editing.status || "new"}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="lead-notes">Notes</label>
                <textarea id="lead-notes" name="notes" rows={3} defaultValue={editing.notes || ""} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" disabled={saving} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={saving}>
                {saving ? <InlineSpinner label="Saving…" /> : "Save Lead"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { deleteLead, saveLead } from "@/app/admin/actions";
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
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Partial<Lead> | null>(null);

  const list = useMemo(
    () =>
      leads.filter(
        (l) =>
          (status === "all" || l.status === status) &&
          (l.name.toLowerCase().includes(q.toLowerCase()) || l.phone.includes(q))
      ),
    [leads, q, status]
  );

  return (
    <>
      <div className="toolbar">
        <div className="search-box2">
          <input placeholder="Search leads by name or phone…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="filters" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "new", "contacted", "converted", "lost"].map((s) => (
            <button key={s} className={`chip-f${status === s ? " active" : ""}`} onClick={() => setStatus(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>+ Add Lead</button>
      </div>
      <div className="card table-wrap static">
        <table className="data">
          <thead>
            <tr>
              <th>Customer</th><th>Phone</th><th>Interested In</th><th>Source</th><th>Status</th><th>Last Contact</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td>{l.phone}</td>
                <td>{l.interest}</td>
                <td><span className="cell-sub">{l.source}</span></td>
                <td><span className={`pill ${l.status}`}>{l.status}</span></td>
                <td><span className="cell-sub">{new Date(l.lastContact).toLocaleString("en-IN")}</span></td>
                <td className="row-actions" style={{ display: "flex", gap: 6 }}>
                  <a className="icon-mini" href={waLink(l.phone)} target="_blank" rel="noreferrer">💬</a>
                  <a className="icon-mini" href={`tel:${l.phone.replace(/\s/g, "")}`}>📞</a>
                  <button className="icon-mini" onClick={() => setEditing(l)}>✎</button>
                  <form action={deleteLead.bind(null, l.id)}>
                    <button className="icon-mini">🗑</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="modal-overlay show" onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
          <form className="card form-card static" style={{ maxWidth: 480, width: "100%" }} action={saveLead} onClick={(e) => e.stopPropagation()}>
            <h3>{editing.id ? "Edit Lead" : "Add New Lead"}</h3>
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="form-row" style={{ marginTop: 12 }}>
              <div className="field"><label>Customer Name</label><input name="name" required defaultValue={editing.name} /></div>
              <div className="form-row two">
                <div className="field"><label>Phone</label><input name="phone" required defaultValue={editing.phone} /></div>
                <div className="field">
                  <label>Source</label>
                  <select name="source" defaultValue={editing.source || "WhatsApp"}>
                    <option>WhatsApp</option>
                    <option>Phone Call</option>
                    <option>Website Enquiry</option>
                    <option>Walk-in</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Interested In</label><input name="interest" defaultValue={editing.interest} /></div>
              <div className="field">
                <label>Status</label>
                <select name="status" defaultValue={editing.status || "new"}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="field"><label>Notes</label><textarea name="notes" rows={3} defaultValue={editing.notes} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary">Save Lead</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

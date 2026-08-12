"use client";

import { useState } from "react";
import { saveCombo } from "@/app/admin/actions";
import { formatInr, mediaUrl } from "@/lib/utils";

export function ComboEditor({
  combo,
}: {
  combo?: {
    id: string;
    name: string;
    tier: string;
    itemsJson: string;
    mrp: number;
    salePrice: number;
    imagePath: string | null;
  };
}) {
  const [name, setName] = useState(combo?.name || "");
  const [tier, setTier] = useState(combo?.tier || "Family Pack");
  const [items, setItems] = useState((combo ? (JSON.parse(combo.itemsJson) as string[]) : []).join("\n"));
  const [mrp, setMrp] = useState(combo?.mrp || 0);
  const [sale, setSale] = useState(combo?.salePrice || 0);
  const [preview, setPreview] = useState("");
  const itemList = items.split("\n").map((s) => s.trim()).filter(Boolean);
  const savePct = mrp ? Math.round((1 - sale / mrp) * 100) : 0;
  const img = preview || (combo?.imagePath ? mediaUrl(combo.imagePath) : "");

  return (
    <form className="editor-split" action={saveCombo}>
      {combo?.id && <input type="hidden" name="id" value={combo.id} />}
      <div className="card form-card static">
        <h3>{combo ? "Edit Combo" : "New Combo Pack"}</h3>
        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="field"><label>Pack name</label><input name="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="field"><label>Tier</label><input name="tier" value={tier} onChange={(e) => setTier(e.target.value)} /></div>
          <div className="form-row two">
            <div className="field"><label>MRP</label><input type="number" name="mrp" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} /></div>
            <div className="field"><label>Sale price</label><input type="number" name="salePrice" value={sale} onChange={(e) => setSale(Number(e.target.value))} /></div>
          </div>
          <div className="field">
            <label>Included items (one per line)</label>
            <textarea name="items" rows={6} value={items} onChange={(e) => setItems(e.target.value)} />
          </div>
          <div className="field">
            <label>Cover image</label>
            <input type="file" name="image" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }} />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16 }}>Save Combo</button>
      </div>
      <div>
        <h3 style={{ marginBottom: 14 }}>Live preview</h3>
        <div className="card combo-card static">
          {img && <img src={img} alt="" style={{ borderRadius: 12, aspectRatio: "16/9", objectFit: "cover" }} />}
          <div className="tier">{tier}</div>
          <h3>{name || "Combo name"}</h3>
          <ul>{itemList.map((i) => <li key={i}>{i}</li>)}</ul>
          <div className="combo-price">
            <span className="old">{formatInr(mrp)}</span>
            <span className="new">{formatInr(sale)}</span>
          </div>
          <span className="save">You save {savePct}%</span>
        </div>
      </div>
    </form>
  );
}

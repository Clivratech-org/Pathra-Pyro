"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCombo } from "@/app/admin/actions";
import { parseComboItems, serializeComboItems, type ComboProductLine } from "@/lib/combo-items";
import { InlineSpinner } from "@/components/page-loader";
import { formatInr, mediaUrl } from "@/lib/utils";

type ProductOption = { id: string; name: string; salePrice: number; category: string };

export function ComboEditor({
  combo,
  products,
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
  products: ProductOption[];
}) {
  const router = useRouter();
  const initial = parseComboItems(combo?.itemsJson || "[]");
  const [name, setName] = useState(combo?.name || "");
  const [tier, setTier] = useState(combo?.tier || "Family Pack");
  const [picked, setPicked] = useState<ComboProductLine[]>(initial.products);
  const [extras, setExtras] = useState(initial.extras.join("\n"));
  const [mrp, setMrp] = useState(combo?.mrp || 0);
  const [sale, setSale] = useState(combo?.salePrice || 0);
  const [preview, setPreview] = useState("");
  const [pickId, setPickId] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [saving, startSave] = useTransition();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return products
      .filter((p) => !picked.some((x) => x.id === p.id))
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      )
      .slice(0, 40);
  }, [products, picked, q]);

  const labels = [
    ...picked.map((p) => (p.qty > 1 ? `${p.name} × ${p.qty}` : p.name)),
    ...extras.split("\n").map((s) => s.trim()).filter(Boolean),
  ];
  const savePct = mrp ? Math.round((1 - sale / mrp) * 100) : 0;
  const img = preview || (combo?.imagePath ? mediaUrl(combo.imagePath) : "");

  function addProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setPicked((prev) => [...prev, { id: p.id, name: p.name, qty: 1 }]);
    setPickId("");
    setQ("");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    const fd = new FormData(e.currentTarget);
    fd.set(
      "itemsJson",
      serializeComboItems({
        products: picked,
        extras: extras
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      })
    );
    startSave(async () => {
      const res = await saveCombo(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOk(res.message || "Combo saved.");
      router.push(`/admin/combos/${res.id}`);
      router.refresh();
    });
  }

  return (
    <form className="editor-split" onSubmit={onSubmit}>
      {combo?.id && <input type="hidden" name="id" value={combo.id} />}
      <div className="card form-card static">
        <div className="toolbar" style={{ marginBottom: 8 }}>
          <Link href="/admin/combos" className="back-link">
            ← All combos
          </Link>
        </div>
        <h3>{combo ? "Edit Combo Pack" : "New Combo Pack"}</h3>
        {error && <div className="alert error">{error}</div>}
        {ok && <div className="alert ok">{ok}</div>}
        <div className="form-stack" style={{ marginTop: 14 }}>
          <div className="field">
            <label>Pack name</label>
            <input name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Tier</label>
            <input name="tier" value={tier} onChange={(e) => setTier(e.target.value)} />
          </div>
          <div className="form-row two">
            <div className="field">
              <label>MRP</label>
              <input type="number" name="mrp" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Sale price</label>
              <input
                type="number"
                name="salePrice"
                value={sale}
                onChange={(e) => setSale(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="field">
            <label>Products in this combo</label>
            <div className="combo-picker">
              <input
                type="search"
                placeholder="Search catalog products…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select value={pickId} onChange={(e) => addProduct(e.target.value)}>
                <option value="">Add product…</option>
                {filtered.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.category} · {p.name} ({formatInr(p.salePrice)})
                  </option>
                ))}
              </select>
            </div>
            <ul className="combo-picked-list">
              {picked.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <input
                    type="number"
                    min={1}
                    value={p.qty}
                    aria-label={`${p.name} quantity`}
                    onChange={(e) =>
                      setPicked((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x
                        )
                      )
                    }
                  />
                  <button
                    type="button"
                    className="icon-mini"
                    onClick={() => setPicked((prev) => prev.filter((x) => x.id !== p.id))}
                  >
                    ✕
                  </button>
                </li>
              ))}
              {!picked.length && <li className="cell-sub">No catalog products added yet.</li>}
            </ul>
          </div>

          <div className="field">
            <label>Extra line items (optional, one per line)</label>
            <textarea
              rows={3}
              value={extras}
              onChange={(e) => setExtras(e.target.value)}
              placeholder="Gift wrapping&#10;Free sparklers pack"
            />
          </div>

          <div className="field">
            <label>Cover image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPreview(URL.createObjectURL(f));
              }}
            />
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={saving}>
          {saving ? <InlineSpinner label="Saving…" /> : "Save Combo"}
        </button>
      </div>
      <div>
        <h3 style={{ marginBottom: 14 }}>Live preview</h3>
        <div className="card combo-card static">
          {img ? (
            <img src={img} alt="" className="combo-cover" />
          ) : (
            <div className="combo-cover placeholder">No image</div>
          )}
          <div className="tier">{tier}</div>
          <h3>{name || "Combo name"}</h3>
          <ul>
            {labels.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
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

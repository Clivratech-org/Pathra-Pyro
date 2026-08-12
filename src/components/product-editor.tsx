"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  saveProduct,
  deleteProductImage,
  setCoverImage,
  reorderProductImages,
} from "@/app/admin/actions";
import { discountPct, formatInr, mediaUrl } from "@/lib/utils";

type Img = { id: string; path: string; isCover: boolean };

export function ProductEditor({
  product,
  categories,
}: {
  product?: {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    mrp: number;
    salePrice: number;
    stock: number;
    featured: boolean;
    active: boolean;
    images: Img[];
  };
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name || "");
  const [catId, setCatId] = useState(product?.categoryId || categories[0]?.id || "");
  const [mrp, setMrp] = useState(product?.mrp || 0);
  const [sale, setSale] = useState(product?.salePrice || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [desc, setDesc] = useState(product?.description || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [images, setImages] = useState<Img[]>(product?.images || []);
  const [previews, setPreviews] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const [pending, startTransition] = useTransition();

  const catName = categories.find((c) => c.id === catId)?.name || "Category";
  const disc = discountPct(mrp, sale);
  const cover = images.find((i) => i.isCover) || images[0];
  const liveImg = previews[0] || (cover ? mediaUrl(cover.path) : "");

  const filesPreview = useMemo(() => previews, [previews]);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...urls]);
  }

  function moveImage(index: number, dir: -1 | 1) {
    if (!product?.id) return;
    const next = index + dir;
    if (next < 0 || next >= images.length) return;
    const reordered = [...images];
    const [item] = reordered.splice(index, 1);
    reordered.splice(next, 0, item);
    setImages(reordered);
    startTransition(async () => {
      await reorderProductImages(
        product.id,
        reordered.map((i) => i.id)
      );
      router.refresh();
    });
  }

  return (
    <form className="editor-split" action={saveProduct}>
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <div className="card form-card static">
        <h3>{product ? "Edit Product" : "Add Product"}</h3>
        <div className="form-row" style={{ marginTop: 14 }}>
          <div className="field">
            <label>Product Name</label>
            <input name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-row two">
            <div className="field">
              <label>Category</label>
              <select name="categoryId" value={catId} onChange={(e) => setCatId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Stock Qty</label>
              <input type="number" name="stock" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            </div>
          </div>
          <div className="form-row two">
            <div className="field">
              <label>Original Price (₹)</label>
              <input type="number" name="mrp" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Sale Price (₹)</label>
              <input type="number" name="salePrice" value={sale} onChange={(e) => setSale(Number(e.target.value))} />
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea name="description" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.85rem" }}>
            <input type="checkbox" name="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured on home
          </label>
          <div className="field">
            <label>Product images (upload files — not URLs)</label>
            <div
              className={`dropzone${over ? " over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(e.dataTransfer.files); const input = e.currentTarget.querySelector("input"); if (input) { const dt = new DataTransfer(); Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f)); (input as HTMLInputElement).files = dt.files; } }}
            >
              Drag & drop images here, or click to browse
              <input type="file" name="images" accept="image/*" multiple style={{ marginTop: 10 }} onChange={(e) => onFiles(e.target.files)} />
            </div>
            <div className="img-chips">
              {images.map((img, idx) => (
                <div className="img-chip" key={img.id}>
                  <img src={mediaUrl(img.path)} alt="" />
                  {img.isCover && <span className="cover">Cover</span>}
                  <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    <button type="button" className="icon-mini" disabled={pending || idx === 0} onClick={() => moveImage(idx, -1)} title="Move left">←</button>
                    <button type="button" className="icon-mini" disabled={pending || idx === images.length - 1} onClick={() => moveImage(idx, 1)} title="Move right">→</button>
                    {!img.isCover && (
                      <button type="button" className="icon-mini" disabled={pending} onClick={() => startTransition(async () => { await setCoverImage(img.id, product!.id); router.refresh(); })}>★</button>
                    )}
                    <button type="button" className="icon-mini" disabled={pending} onClick={() => startTransition(async () => { await deleteProductImage(img.id, product!.id); setImages((prev) => prev.filter((i) => i.id !== img.id)); router.refresh(); })}>✕</button>
                  </div>
                </div>
              ))}
              {filesPreview.map((src) => (
                <div className="img-chip" key={src}>
                  <img src={src} alt="" />
                  <span className="cover">New</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 18 }}>Save Product</button>
      </div>

      <div>
        <h3 style={{ marginBottom: 14 }}>Live preview</h3>
        <div className="card product-card static">
          <div className="imgwrap">
            {liveImg ? <img src={liveImg} alt="" /> : <div style={{ height: "100%", background: "rgba(255,255,255,0.04)" }} />}
            {disc > 0 && <div className="off-badge">{disc}% OFF</div>}
          </div>
          <div className="body">
            <div className="cat">{catName}</div>
            <h4>{name || "Product name"}</h4>
            <div className="price-row">
              <span className="old">{formatInr(mrp || 0)}</span>
              <span className="new">{formatInr(sale || 0)}</span>
            </div>
            <div className="qty-row">
              <div className="qty-selector"><button type="button">−</button><span className="val">1</span><button type="button">+</button></div>
              <button className="add-cart-btn" type="button">Add to Cart</button>
            </div>
          </div>
        </div>
        <div className="card static" style={{ marginTop: 18, padding: 16 }}>
          <div className="eyebrow">Detail gallery</div>
          <div className="pdp-thumbs">
            {images.map((img) => (
              <button type="button" key={img.id}><img src={mediaUrl(img.path)} alt="" /></button>
            ))}
            {filesPreview.map((src) => (
              <button type="button" key={src}><img src={src} alt="" /></button>
            ))}
          </div>
          <p style={{ color: "var(--cream-dim)", fontSize: "0.85rem", marginTop: 12 }}>{desc || "Description appears here as you type."}</p>
        </div>
      </div>
    </form>
  );
}

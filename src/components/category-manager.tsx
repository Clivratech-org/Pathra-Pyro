"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { useConfirm } from "@/components/confirm-dialog";
import { InlineSpinner } from "@/components/page-loader";
import { mediaUrl } from "@/lib/utils";

type Cat = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  coverPath: string | null;
  productCount: number;
};

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2500);
  }

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveCategory(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCreating(false);
      flash(res.message || "Category created.");
      router.refresh();
    });
  }

  async function onDelete(cat: Cat) {
    const ok = await confirm({
      title: "Delete category?",
      message:
        cat.productCount > 0
          ? `“${cat.name}” still has ${cat.productCount} product(s). Remove those products first.`
          : `Delete “${cat.name}”? This cannot be undone.`,
      confirmLabel: cat.productCount > 0 ? "OK" : "Delete",
      danger: cat.productCount === 0,
    });
    if (!ok || cat.productCount > 0) return;
    startTransition(async () => {
      const res = await deleteCategory(cat.id);
      flash(res.ok ? res.message || "Deleted." : res.error);
      router.refresh();
    });
  }

  return (
    <>
      {dialog}
      {toast && <div className="toast-banner ok">{toast}</div>}
      <div className="toolbar">
        <p className="page-sub">Choose a category to manage its products, or create a new one.</p>
        <button className="btn btn-primary" type="button" onClick={() => setCreating(true)}>
          + New Category
        </button>
      </div>
      <div className="pm-grid category-grid">
        {sorted.map((c) => (
          <Link key={c.id} href={`/admin/products/category/${c.id}`} className="card pm-card category-card">
            <div className="pm-card-media">
              {c.coverPath ? (
                <img src={mediaUrl(c.coverPath)} alt={c.name} />
              ) : (
                <div className="pm-card-fallback">{c.emoji}</div>
              )}
            </div>
            <div className="body">
              <div className="cat">{c.emoji} Category</div>
              <h4>{c.name}</h4>
              <p className="cell-sub">{c.productCount} product{c.productCount === 1 ? "" : "s"}</p>
              <div className="pm-card-actions" onClick={(e) => e.preventDefault()}>
                <button
                  type="button"
                  className="icon-mini"
                  title="Delete category"
                  disabled={pending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(c);
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {creating && (
        <div className="modal-overlay show" onClick={() => !pending && setCreating(false)}>
          <form className="card form-card static modal-panel" onSubmit={onCreate} onClick={(e) => e.stopPropagation()}>
            <h3>New Category</h3>
            {error && <div className="alert error">{error}</div>}
            <div className="form-stack">
              <div className="field">
                <label htmlFor="cat-name">Name</label>
                <input id="cat-name" name="name" required placeholder="e.g. Sparklers" />
              </div>
              <div className="field">
                <label htmlFor="cat-emoji">Emoji</label>
                <input id="cat-emoji" name="emoji" defaultValue="🎆" maxLength={8} />
              </div>
              <div className="field">
                <label htmlFor="cat-desc">Description</label>
                <textarea id="cat-desc" name="description" rows={3} placeholder="Short category description" />
              </div>
              <div className="field">
                <label htmlFor="cat-cover">Cover image (optional)</label>
                <input id="cat-cover" type="file" name="cover" accept="image/*" />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" disabled={pending} onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" disabled={pending}>
                {pending ? <InlineSpinner label="Creating…" /> : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

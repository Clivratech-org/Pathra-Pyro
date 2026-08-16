"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCombo } from "@/app/admin/actions";
import { useConfirm } from "@/components/confirm-dialog";
import { comboItemsAsLabels } from "@/lib/combo-items";
import { formatInr, mediaUrl } from "@/lib/utils";

type Combo = {
  id: string;
  name: string;
  tier: string;
  salePrice: number;
  imagePath: string | null;
  itemsJson: string;
};

export function CombosAdminClient({ combos }: { combos: Combo[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [pending, startTransition] = useTransition();

  async function onDelete(c: Combo) {
    const ok = await confirm({
      title: "Delete combo pack?",
      message: `Delete “${c.name}”? This cannot be undone.`,
      confirmLabel: "Delete combo",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      await deleteCombo(c.id);
      router.refresh();
    });
  }

  return (
    <>
      {dialog}
      <div className="toolbar">
        <p className="page-sub">Click a pack to view products and edit the bundle.</p>
        <Link className="btn btn-primary" href="/admin/combos/new">
          + New Combo
        </Link>
      </div>
      <div className="pm-grid">
        {combos.map((c) => {
          const items = comboItemsAsLabels(c.itemsJson);
          return (
            <div className="card pm-card static combo-admin-card" key={c.id}>
              <Link href={`/admin/combos/${c.id}`} className="pm-card-media">
                <img src={mediaUrl(c.imagePath)} alt={c.name} />
              </Link>
              <div className="body">
                <div className="cell-sub">{c.tier}</div>
                <h4>
                  <Link href={`/admin/combos/${c.id}`}>{c.name}</Link>
                </h4>
                <div className="pm-price-row">
                  <span className="sale">{formatInr(c.salePrice)}</span>
                </div>
                <ul className="combo-mini-list">
                  {items.slice(0, 4).map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                  {items.length > 4 && <li>+{items.length - 4} more</li>}
                </ul>
                <div className="pm-card-actions">
                  <Link className="btn btn-outline btn-sm" href={`/admin/combos/${c.id}`}>
                    View / Edit
                  </Link>
                  <button
                    type="button"
                    className="icon-mini"
                    disabled={pending}
                    title="Delete"
                    onClick={() => onDelete(c)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

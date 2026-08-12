import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr, mediaUrl } from "@/lib/utils";
import { deleteCombo } from "@/app/admin/actions";

export default async function CombosAdminPage() {
  const combos = await prisma.comboPack.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <div className="toolbar">
        <p className="page-sub">Bundled packs shown on the public combo page</p>
        <Link className="btn btn-primary" href="/admin/combos/new">+ New Combo</Link>
      </div>
      <div className="pm-grid">
        {combos.map((c) => (
          <div className="card pm-card static" key={c.id}>
            <img src={mediaUrl(c.imagePath)} alt={c.name} />
            <div className="body">
              <div className="cell-sub">{c.tier}</div>
              <h4 style={{ color: "var(--cream)", margin: "6px 0" }}>{c.name}</h4>
              <div style={{ fontFamily: "var(--mono)", color: "var(--gold-2)" }}>{formatInr(c.salePrice)}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link className="icon-mini" href={`/admin/combos/${c.id}`}>✎</Link>
                <form action={deleteCombo.bind(null, c.id)}><button className="icon-mini">🗑</button></form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

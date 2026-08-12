import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { coverPath } from "@/lib/product-map";
import { formatInr, mediaUrl, stockStatus } from "@/lib/utils";
import { deleteProduct } from "@/app/admin/actions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "all" } = await searchParams;
  const categories = await prisma.category.findMany({ where: { slug: { not: "combo-packs" } }, orderBy: { sortOrder: "asc" } });
  const products = await prisma.product.findMany({
    where: {
      ...(cat !== "all" ? { categoryId: cat } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { images: true, category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <div className="toolbar">
        <form className="search-box2">
          <input name="q" defaultValue={q} placeholder="Search products…" />
        </form>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/admin/products" className={`chip-f${cat === "all" ? " active" : ""}`}>All</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/admin/products?cat=${c.id}`} className={`chip-f${cat === c.id ? " active" : ""}`}>
              {c.name}
            </Link>
          ))}
        </div>
        <Link className="btn btn-primary" href="/admin/products/new">+ Add Product</Link>
      </div>
      <div className="pm-grid">
        {products.map((p) => {
          const st = stockStatus(p.stock);
          return (
            <div className="card pm-card static" key={p.id}>
              <img src={mediaUrl(coverPath(p))} alt={p.name} />
              <div className="body">
                <div className="cat" style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--marigold)", fontWeight: 700 }}>{p.category.name}</div>
                <h4 style={{ fontFamily: "var(--body)", fontSize: "0.92rem", color: "var(--cream)", margin: "4px 0 8px" }}>{p.name}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)" }}>
                  <span style={{ color: "var(--gold-2)", fontWeight: 700 }}>{formatInr(p.salePrice)}</span>
                  <span style={{ textDecoration: "line-through", color: "var(--cream-dim)", fontSize: "0.72rem" }}>{formatInr(p.mrp)}</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <span className={`pill ${st.key}`}>{st.label}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Link className="icon-mini" href={`/admin/products/${p.id}`}>✎</Link>
                  <form action={deleteProduct.bind(null, p.id)}>
                    <button className="icon-mini">🗑</button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ManualBillForm } from "@/components/manual-bill-form";
import { getActiveOffers, priceCombo, priceProduct } from "@/lib/offers";

export const dynamic = "force-dynamic";

export default async function ManualBillPage() {
  const [products, combos, settings, offers] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.comboPack.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    getSettings(),
    getActiveOffers(),
  ]);

  const catalog = [
    ...products.map((p) => {
      const priced = priceProduct(p, offers);
      return {
        kind: "product" as const,
        id: p.id,
        name: p.name,
        category: p.category.name,
        mrp: p.mrp,
        sale: priced.effectiveSale,
        stock: p.stock,
      };
    }),
    ...combos.map((c) => {
      const priced = priceCombo(c, offers);
      return {
        kind: "combo" as const,
        id: c.id,
        name: c.name,
        category: "Combo Pack",
        mrp: c.mrp,
        sale: priced.effectiveSale,
      };
    }),
  ];

  return (
    <div className="customer-detail">
      <Link href="/admin/sales" className="customer-back">
        ← Back to sales
      </Link>
      <div className="panel-head" style={{ marginBottom: 8 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Manual billing</h2>
      </div>
      <p className="page-sub" style={{ marginBottom: 18 }}>
        Create an offline / walk-in bill. It will appear in Sales Management with invoice and checklist downloads.
      </p>
      <ManualBillForm catalog={catalog} gstPercent={settings.gstPercent} />
    </div>
  );
}

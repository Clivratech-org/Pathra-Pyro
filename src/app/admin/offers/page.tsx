import { OffersClient } from "@/components/offers-client";
import { prisma } from "@/lib/prisma";

export default async function OffersPage() {
  const [offers, categories] = await Promise.all([
    prisma.offer.findMany({ include: { category: true }, orderBy: { startDate: "desc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <OffersClient
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      offers={offers.map((o) => ({
        id: o.id,
        title: o.title,
        pct: o.pct,
        appliesTo: o.appliesTo,
        categoryId: o.categoryId,
        startDate: o.startDate.toISOString(),
        endDate: o.endDate.toISOString(),
        status: o.status,
        usedPct: o.usedPct,
        categoryName: o.category?.name,
      }))}
    />
  );
}

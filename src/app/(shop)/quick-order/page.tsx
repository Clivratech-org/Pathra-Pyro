import { QuickOrderTable } from "@/components/quick-order-table";
import { fetchPricedProducts, toPricedCard } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export default async function QuickOrderPage() {
  const [products, cats] = await Promise.all([
    fetchPricedProducts(),
    prisma.category.findMany({
      where: { slug: { not: "combo-packs" } },
      orderBy: { sortOrder: "asc" },
      select: { name: true },
    }),
  ]);
  return <QuickOrderTable products={products.map(toPricedCard)} categories={cats} />;
}

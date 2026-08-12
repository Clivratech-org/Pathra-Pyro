import { ShopBrowser } from "@/components/shop-browser";
import { fetchPricedProducts, toPricedCard } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    fetchPricedProducts(),
    prisma.category.findMany({
      where: { slug: { not: "combo-packs" } },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <ShopBrowser
      title="Shop All Crackers"
      eyebrow="Full Catalogue"
      desc="Browse every variety we stock this season. Filter by category, search by name, and add to cart in one tap."
      products={products.map(toPricedCard)}
      categories={categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.products }))}
    />
  );
}

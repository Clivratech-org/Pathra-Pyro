import { notFound } from "next/navigation";
import { ShopBrowser } from "@/components/shop-browser";
import { fetchPricedProducts, toPricedCard } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const products = await fetchPricedProducts({ categoryId: category.id });

  return (
    <ShopBrowser
      title={category.name}
      eyebrow="Category"
      desc={category.description}
      initialCat={category.name}
      products={products.map(toPricedCard)}
      categories={[{ name: category.name, slug: category.slug, count: products.length }]}
    />
  );
}

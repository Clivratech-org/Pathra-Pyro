import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { fetchPricedProductBySlug, fetchPricedProducts, toPricedCard } from "@/lib/catalog";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchPricedProductBySlug(slug);
  if (!product) notFound();

  const related = await fetchPricedProducts({
    categoryId: product.categoryId,
    id: { not: product.id },
  });

  return (
    <ProductDetail
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        cat: product.category.name,
        mrp: product.mrp,
        sale: product.effectiveSale,
        stock: product.stock,
        images: product.images.map((i) => ({ path: i.path, alt: i.alt || product.name })),
      }}
      related={related.slice(0, 4).map(toPricedCard)}
    />
  );
}

import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/product-editor";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    prisma.category.findMany({ where: { slug: { not: "combo-packs" } }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();
  return (
    <ProductEditor
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        mrp: product.mrp,
        salePrice: product.salePrice,
        stock: product.stock,
        featured: product.featured,
        active: product.active,
        images: product.images.map((i) => ({ id: i.id, path: i.path, isCover: i.isCover })),
      }}
    />
  );
}

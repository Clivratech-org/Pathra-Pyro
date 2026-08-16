import { notFound } from "next/navigation";
import { CategoryProductsClient } from "@/components/category-products-client";
import { coverPath } from "@/lib/product-map";
import { prisma } from "@/lib/prisma";

export default async function CategoryProductsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true, emoji: true },
  });
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: id },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <CategoryProductsClient
      category={category}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        mrp: p.mrp,
        salePrice: p.salePrice,
        stock: p.stock,
        cover: coverPath(p),
      }))}
    />
  );
}

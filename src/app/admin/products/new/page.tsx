import { ProductEditor } from "@/components/product-editor";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { slug: { not: "combo-packs" } },
    orderBy: { sortOrder: "asc" },
  });
  return <ProductEditor categories={categories.map((c) => ({ id: c.id, name: c.name }))} />;
}

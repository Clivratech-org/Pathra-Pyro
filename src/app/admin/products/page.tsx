import { CategoryManager } from "@/components/category-manager";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const categories = await prisma.category.findMany({
    where: { slug: { not: "combo-packs" } },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      emoji: true,
      description: true,
      coverPath: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <CategoryManager
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        description: c.description,
        coverPath: c.coverPath,
        productCount: c._count.products,
      }))}
    />
  );
}

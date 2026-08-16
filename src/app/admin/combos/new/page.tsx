import { ComboEditor } from "@/components/combo-editor";
import { prisma } from "@/lib/prisma";

export default async function NewComboPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      salePrice: true,
      category: { select: { name: true } },
    },
    take: 500,
  });
  return (
    <ComboEditor
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        salePrice: p.salePrice,
        category: p.category.name,
      }))}
    />
  );
}

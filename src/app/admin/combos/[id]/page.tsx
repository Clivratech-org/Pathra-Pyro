import { notFound } from "next/navigation";
import { ComboEditor } from "@/components/combo-editor";
import { prisma } from "@/lib/prisma";

export default async function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [combo, products] = await Promise.all([
    prisma.comboPack.findUnique({ where: { id } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        salePrice: true,
        category: { select: { name: true } },
      },
      take: 500,
    }),
  ]);
  if (!combo) notFound();
  return (
    <ComboEditor
      combo={combo}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        salePrice: p.salePrice,
        category: p.category.name,
      }))}
    />
  );
}

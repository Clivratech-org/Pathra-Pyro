import { CombosAdminClient } from "@/components/combos-admin-client";
import { prisma } from "@/lib/prisma";

export default async function CombosAdminPage() {
  const combos = await prisma.comboPack.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      tier: true,
      salePrice: true,
      imagePath: true,
      itemsJson: true,
    },
  });
  return <CombosAdminClient combos={combos} />;
}

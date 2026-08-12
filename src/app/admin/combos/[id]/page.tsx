import { notFound } from "next/navigation";
import { ComboEditor } from "@/components/combo-editor";
import { prisma } from "@/lib/prisma";

export default async function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const combo = await prisma.comboPack.findUnique({ where: { id } });
  if (!combo) notFound();
  return <ComboEditor combo={combo} />;
}

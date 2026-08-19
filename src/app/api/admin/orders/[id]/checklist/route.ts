import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildChecklistPdf, pdfFileResponse } from "@/lib/order-pdf";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id.toUpperCase() }] },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const settings = await getSettings();
  const bytes = await buildChecklistPdf(order, settings);
  return pdfFileResponse(bytes, `checklist-${order.orderNumber}.pdf`);
}

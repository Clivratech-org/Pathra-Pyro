import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildInvoicePdf, pdfFileResponse } from "@/lib/order-pdf";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in to download the invoice." }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id.toUpperCase() }] },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = session.user.role === "CUSTOMER" && order.userId === session.user.id;
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "You can only download invoices for your own orders." }, { status: 403 });
  }

  const settings = await getSettings();
  const bytes = await buildInvoicePdf(order, settings);
  return pdfFileResponse(bytes, `invoice-${order.orderNumber}.pdf`);
}

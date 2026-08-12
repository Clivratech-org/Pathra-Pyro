import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await prisma.order.findMany({ include: { items: true, shipment: true }, orderBy: { createdAt: "desc" } });
  const header = ["Order ID", "Customer", "Phone", "Items", "Amount", "Payment", "Channel", "Shipment", "Date"];
  const rows = orders.map((o) => [
    o.orderNumber,
    o.customerName,
    o.customerPhone,
    String(o.items.reduce((s, i) => s + i.qty, 0)),
    String(o.total),
    o.paymentStatus,
    o.channel,
    o.shipment?.status || "",
    o.createdAt.toISOString(),
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=pathra-sales.csv",
    },
  });
}

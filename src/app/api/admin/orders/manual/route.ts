import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cartTotals, nextOrderNumber, type CartLine } from "@/lib/utils";
import { revalidatePath } from "next/cache";

type ManualItem = {
  kind: "product" | "combo";
  id: string;
  name?: string;
  category?: string;
  mrp?: number;
  sale?: number;
  qty: number;
};

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const customer = body.customer as {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    pincode?: string;
  };
  const rawItems = (body.items || []) as ManualItem[];
  const name = String(customer?.name || "").trim();
  const phone = String(customer?.phone || "").trim();
  if (!name || !phone) {
    return NextResponse.json({ error: "Customer name and phone are required." }, { status: 400 });
  }
  if (!rawItems.length) {
    return NextResponse.json({ error: "Add at least one product." }, { status: 400 });
  }

  const deductStock = Boolean(body.deductStock);
  const paymentStatus = body.paymentStatus === "pending" ? "pending" : "paid";
  const packingCharge = Math.max(0, Math.round(Number(body.packingCharge) || 0));
  const shippingCharge = Math.max(0, Math.round(Number(body.shippingCharge) || 0));
  const gstPercent = Math.max(0, Number(body.gstPercent) || 0);

  const lines: CartLine[] = [];
  for (const item of rawItems) {
    const qty = Math.max(1, Math.round(Number(item.qty) || 0));
    if (!qty) continue;
    if (item.kind === "combo") {
      const combo = await prisma.comboPack.findUnique({ where: { id: item.id } });
      if (!combo) return NextResponse.json({ error: `Combo not found: ${item.name || item.id}` }, { status: 400 });
      lines.push({
        kind: "combo" as const,
        id: combo.id,
        name: combo.name,
        cat: "Combo Pack",
        mrp: combo.mrp,
        sale: Math.max(0, Math.round(Number(item.sale ?? combo.salePrice) || 0)),
        img: combo.imagePath || "",
        qty,
        key: `combo:${combo.id}`,
      });
      continue;
    }

    const product = await prisma.product.findUnique({
      where: { id: item.id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) return NextResponse.json({ error: `Product not found: ${item.name || item.id}` }, { status: 400 });
    if (deductStock && product.stock < qty) {
      return NextResponse.json({ error: `${product.name} has only ${product.stock} in stock.` }, { status: 400 });
    }
    lines.push({
      kind: "product" as const,
      id: product.id,
      name: product.name,
      cat: product.category.name,
      mrp: product.mrp,
      sale: Math.max(0, Math.round(Number(item.sale ?? product.salePrice) || 0)),
      img: product.images.find((i) => i.isCover)?.path || product.images[0]?.path || "",
      qty,
      key: `product:${product.id}`,
    });
  }

  if (!lines.length) {
    return NextResponse.json({ error: "Add at least one product." }, { status: 400 });
  }

  const totals = cartTotals(lines, { gstPercent, packingCharge, shippingCharge });
  const last = await prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { orderNumber: true } });
  const orderNumber = nextOrderNumber(last?.orderNumber);
  const address = String(customer?.address || "").trim() || "Counter sale / pickup";
  const pincode = String(customer?.pincode || "").trim() || "000000";

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: name,
      customerPhone: phone,
      customerEmail: String(customer?.email || "").trim() || null,
      address,
      pincode,
      subtotal: totals.subtotal,
      savings: totals.savings,
      gstPercent: totals.gstPercent,
      gstAmount: totals.gstAmount,
      packingCharge: totals.packingCharge,
      shippingCharge: totals.shippingCharge,
      total: totals.total,
      paymentStatus,
      channel: "Offline",
      items: {
        create: lines.map((i) => ({
          kind: i.kind,
          refId: i.id,
          name: i.name,
          category: i.cat,
          imagePath: i.img,
          mrp: i.mrp,
          salePrice: i.sale,
          qty: i.qty,
        })),
      },
      shipment: {
        create: {
          status: paymentStatus === "paid" ? "confirmed" : "placed",
          events: {
            create: {
              status: paymentStatus === "paid" ? "confirmed" : "placed",
              note: "Offline / walk-in bill created by admin",
            },
          },
        },
      },
    },
  });

  if (deductStock) {
    for (const line of lines) {
      if (line.kind !== "product") continue;
      await prisma.product.update({
        where: { id: line.id },
        data: { stock: { decrement: line.qty } },
      });
    }
  }

  revalidatePath("/admin/sales");
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${order.id}`);

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
  });
}

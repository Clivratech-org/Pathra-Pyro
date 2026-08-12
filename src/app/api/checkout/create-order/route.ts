import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveCartLines } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { getRazorpay, razorpayConfigured } from "@/lib/razorpay";
import { cartTotals, nextOrderNumber } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const customer = body.customer as {
    name: string;
    phone: string;
    email?: string;
    address: string;
    pincode: string;
  };
  const rawItems = (body.items || []) as { kind: "product" | "combo"; id: string; qty: number }[];
  if (!customer?.name || !customer?.phone || !customer?.address || !customer?.pincode) {
    return NextResponse.json({ error: "Please fill all delivery details." }, { status: 400 });
  }

  const { lines: items, error } = await resolveCartLines(rawItems);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const totals = cartTotals(items);
  const last = await prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { orderNumber: true } });
  const orderNumber = nextOrderNumber(last?.orderNumber);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.role === "CUSTOMER" ? session.user.id : null,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email || null,
      address: customer.address,
      pincode: customer.pincode,
      subtotal: totals.subtotal,
      savings: totals.savings,
      total: totals.subtotal,
      paymentStatus: "pending",
      channel: "Website",
      items: {
        create: items.map((i) => ({
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
          status: "placed",
          events: { create: { status: "placed", note: "Order created, awaiting payment" } },
        },
      },
    },
  });

  if (!razorpayConfigured()) {
    return NextResponse.json({
      demo: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: totals.subtotal * 100,
    });
  }

  const rzp = getRazorpay();
  const rzOrder = await rzp.orders.create({
    amount: totals.subtotal * 100,
    currency: "INR",
    receipt: order.orderNumber,
  });
  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: rzOrder.id },
  });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    razorpayOrderId: rzOrder.id,
    amount: rzOrder.amount,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}

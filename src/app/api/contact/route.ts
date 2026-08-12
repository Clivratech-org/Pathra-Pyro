import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const message = String(body.message || "").trim();
  if (!name || !phone || !message) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  await prisma.lead.create({
    data: {
      name,
      phone,
      interest: message.slice(0, 180),
      source: "Website Enquiry",
      status: "new",
      notes: message,
    },
  });
  return NextResponse.json({ ok: true });
}

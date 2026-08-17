import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").replace(/\D/g, "").slice(-10);
  const email = String(body.email || "").trim().toLowerCase() || null;
  const password = String(body.password || "");
  if (!name || phone.length !== 10 || password.length < 6) {
    return NextResponse.json({ error: "Name, 10-digit phone and 6+ character password required." }, { status: 400 });
  }
  const exists = await prisma.user.findFirst({
    where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
  });
  if (exists) return NextResponse.json({ error: "An account with this phone or email already exists." }, { status: 400 });
  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: "CUSTOMER",
    },
  });
  await prisma.lead.updateMany({
    where: { userId: null, phone: { contains: phone } },
    data: { userId: user.id },
  });
  return NextResponse.json({ ok: true });
}

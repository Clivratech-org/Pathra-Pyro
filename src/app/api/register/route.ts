import { NextResponse } from "next/server";
import { registerCustomer } from "@/lib/customer-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await registerCustomer({
    name: String(body.name || ""),
    phone: String(body.phone || ""),
    email: body.email ? String(body.email) : null,
    password: String(body.password || ""),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

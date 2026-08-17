import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export async function registerCustomer(input: {
  name: string;
  phone: string;
  email?: string | null;
  password: string;
}) {
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  const email = input.email?.trim().toLowerCase() || null;
  const password = input.password;

  if (!name || phone.length !== 10 || password.length < 6) {
    return { ok: false as const, error: "Name, 10-digit phone and 6+ character password required." };
  }

  const exists = await prisma.user.findFirst({
    where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
  });
  if (exists) {
    return { ok: false as const, error: "An account with this phone or email already exists." };
  }

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

  return { ok: true as const, phone };
}

export async function findCustomerByIdentifier(identifierRaw: string) {
  const identifier = identifierRaw.trim().toLowerCase();
  const phone = normalizePhone(identifierRaw);

  if (identifier.includes("@")) {
    return prisma.user.findFirst({ where: { email: identifier } });
  }
  if (phone.length === 10) {
    return prisma.user.findFirst({ where: { phone } });
  }
  return null;
}

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ProfileResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(formData: FormData): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return { ok: false, error: "Please log in." };
  }
  const name = String(formData.get("name") || "").trim();
  const emailRaw = String(formData.get("email") || "").trim().toLowerCase();
  const address = String(formData.get("address") || "").trim();
  const pincode = String(formData.get("pincode") || "").replace(/\D/g, "").slice(0, 6);
  if (!name) return { ok: false, error: "Name is required." };
  if (emailRaw) {
    const taken = await prisma.user.findFirst({
      where: { email: emailRaw, NOT: { id: session.user.id } },
    });
    if (taken) return { ok: false, error: "That email is already used on another account." };
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      email: emailRaw || null,
      address: address || null,
      pincode: pincode || null,
    },
  });
  revalidatePath("/account");
  return { ok: true };
}

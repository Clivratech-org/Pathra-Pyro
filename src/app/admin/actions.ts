"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveSettings, type SiteSettings } from "@/lib/settings";
import { saveUpload } from "@/lib/uploads";
import { slugify } from "@/lib/utils";

type LeadStatus = "new" | "contacted" | "converted" | "lost";
type OfferApplies = "ALL" | "CATEGORY" | "COMBOS";
type OfferStatus = "active" | "paused" | "expired";
type ShipmentStatus = "placed" | "confirmed" | "packed" | "dispatched" | "in_transit" | "delivered" | "cancelled";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function saveLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    interest: String(formData.get("interest") || "").trim(),
    source: String(formData.get("source") || "Website Enquiry"),
    status: String(formData.get("status") || "new") as LeadStatus,
    notes: String(formData.get("notes") || ""),
    lastContact: new Date(),
  };
  if (id) await prisma.lead.update({ where: { id }, data });
  else await prisma.lead.create({ data });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLead(id: string) {
  await requireAdmin();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
}

export async function saveOffer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const appliesTo = String(formData.get("appliesTo") || "ALL") as OfferApplies;
  const data = {
    title: String(formData.get("title") || "").trim(),
    pct: Number(formData.get("pct") || 0),
    appliesTo,
    categoryId: appliesTo === "CATEGORY" ? String(formData.get("categoryId") || "") || null : null,
    startDate: new Date(String(formData.get("startDate"))),
    endDate: new Date(String(formData.get("endDate"))),
    status: String(formData.get("status") || "active") as OfferStatus,
  };
  if (id) await prisma.offer.update({ where: { id }, data });
  else await prisma.offer.create({ data });
  revalidatePath("/admin/offers");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/combos");
}

export async function deleteOffer(id: string) {
  await requireAdmin();
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/admin/offers");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/combos");
}

export async function saveBusinessSettings(formData: FormData) {
  await requireAdmin();
  const data: SiteSettings = {
    businessName: String(formData.get("businessName") || ""),
    tagline: String(formData.get("tagline") || ""),
    gstin: String(formData.get("gstin") || ""),
    license: String(formData.get("license") || ""),
    address: String(formData.get("address") || ""),
    cityLine: String(formData.get("cityLine") || ""),
    phone: String(formData.get("phone") || ""),
    phone2: String(formData.get("phone2") || ""),
    whatsapp: String(formData.get("whatsapp") || ""),
    email: String(formData.get("email") || ""),
    hours: String(formData.get("hours") || ""),
    mapEmbed: String(formData.get("mapEmbed") || ""),
    marquee: String(formData.get("marquee") || ""),
  };
  await saveSettings(data);
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const payload = {
    name,
    slug: slugify(name) + (id ? "" : `-${Date.now().toString().slice(-4)}`),
    description: String(formData.get("description") || ""),
    categoryId: String(formData.get("categoryId") || ""),
    mrp: Number(formData.get("mrp") || 0),
    salePrice: Number(formData.get("salePrice") || 0),
    stock: Number(formData.get("stock") || 0),
    featured: formData.get("featured") === "on",
    active: formData.get("active") !== "off",
    popularity: Number(formData.get("popularity") || 0.5),
  };
  let productId = id;
  if (id) {
    const existing = await prisma.product.findUnique({ where: { id } });
    await prisma.product.update({
      where: { id },
      data: { ...payload, slug: existing?.slug || payload.slug },
    });
  } else {
    const created = await prisma.product.create({ data: payload });
    productId = created.id;
  }

  const files = formData.getAll("images") as File[];
  const existingImages = await prisma.productImage.count({ where: { productId } });
  let sort = existingImages;
  for (const file of files) {
    if (!file || typeof file === "string" || !file.size) continue;
    const path = await saveUpload(file, "products");
    await prisma.productImage.create({
      data: {
        productId,
        path,
        alt: name,
        sortOrder: sort,
        isCover: existingImages === 0 && sort === 0,
      },
    });
    sort += 1;
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect(`/admin/products/${productId}`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductImage(id: string, productId: string) {
  await requireAdmin();
  await prisma.productImage.delete({ where: { id } });
  const first = await prisma.productImage.findFirst({ where: { productId }, orderBy: { sortOrder: "asc" } });
  if (first) await prisma.productImage.update({ where: { id: first.id }, data: { isCover: true } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function setCoverImage(id: string, productId: string) {
  await requireAdmin();
  await prisma.productImage.updateMany({ where: { productId }, data: { isCover: false } });
  await prisma.productImage.update({ where: { id }, data: { isCover: true } });
  revalidatePath(`/admin/products/${productId}`);
}

export async function reorderProductImages(productId: string, imageIds: string[]) {
  await requireAdmin();
  for (let i = 0; i < imageIds.length; i++) {
    await prisma.productImage.update({
      where: { id: imageIds[i] },
      data: { sortOrder: i, isCover: i === 0 },
    });
  }
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

export async function saveCombo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const items = String(formData.get("items") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const data = {
    name,
    slug: slugify(name) + (id ? "" : `-${Date.now().toString().slice(-4)}`),
    tier: String(formData.get("tier") || ""),
    itemsJson: JSON.stringify(items),
    mrp: Number(formData.get("mrp") || 0),
    salePrice: Number(formData.get("salePrice") || 0),
    active: formData.get("active") !== "off",
  };
  let comboId = id;
  const file = formData.get("image") as File | null;
  let imagePath: string | undefined;
  if (file && typeof file !== "string" && file.size) {
    imagePath = await saveUpload(file, "combos");
  }
  if (id) {
    const existing = await prisma.comboPack.findUnique({ where: { id } });
    await prisma.comboPack.update({
      where: { id },
      data: { ...data, slug: existing?.slug || data.slug, ...(imagePath ? { imagePath } : {}) },
    });
  } else {
    const created = await prisma.comboPack.create({ data: { ...data, imagePath } });
    comboId = created.id;
  }
  revalidatePath("/admin/combos");
  revalidatePath("/combos");
  redirect(`/admin/combos/${comboId}`);
}

export async function deleteCombo(id: string) {
  await requireAdmin();
  await prisma.comboPack.delete({ where: { id } });
  revalidatePath("/admin/combos");
  redirect("/admin/combos");
}

export async function updateShipment(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status")) as ShipmentStatus;
  const note = String(formData.get("note") || "");
  const shipment = await prisma.shipment.findUnique({ where: { orderId } });
  if (!shipment) return;
  await prisma.shipment.update({ where: { id: shipment.id }, data: { status, note } });
  await prisma.shipmentEvent.create({ data: { shipmentId: shipment.id, status, note } });
  const files = formData.getAll("photos") as File[];
  const caption = String(formData.get("caption") || "");
  for (const file of files) {
    if (!file || typeof file === "string" || !file.size) continue;
    const path = await saveUpload(file, "tracking");
    await prisma.shipmentPhoto.create({
      data: { shipmentId: shipment.id, path, caption, stage: status },
    });
  }
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function deleteProductRedirectSafe(id: string) {
  await deleteProduct(id);
}

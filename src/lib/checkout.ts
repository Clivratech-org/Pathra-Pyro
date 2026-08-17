import { prisma } from "@/lib/prisma";
import { getActiveOffers, priceCombo, priceProduct } from "@/lib/offers";
import { coverPath } from "@/lib/product-map";
import type { CartLine } from "@/lib/utils";

type CartInput = { kind: "product" | "combo"; id: string; qty: number };

export async function resolveCartLines(
  items: CartInput[]
): Promise<{ lines: CartLine[]; error?: string }> {
  if (!items.length) return { lines: [], error: "Cart is empty." };

  const offers = await getActiveOffers();
  const lines: CartLine[] = [];

  for (const item of items) {
    if (item.qty <= 0) continue;

    if (item.kind === "product") {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      });
      if (!product || !product.active) {
        return { lines: [], error: `Product unavailable: ${item.id}` };
      }
      if (product.stock < item.qty) {
        return { lines: [], error: `${product.name} has only ${product.stock} in stock.` };
      }
      const priced = priceProduct(product, offers);
      lines.push({
        key: `product:${product.id}`,
        kind: "product",
        id: product.id,
        name: product.name,
        cat: product.category.name,
        mrp: product.mrp,
        sale: priced.effectiveSale,
        img: coverPath(product),
        qty: item.qty,
        slug: product.slug,
      });
    } else {
      const combo = await prisma.comboPack.findUnique({ where: { id: item.id } });
      if (!combo || !combo.active) {
        return { lines: [], error: `Combo unavailable: ${item.id}` };
      }
      const priced = priceCombo(combo, offers);
      lines.push({
        key: `combo:${combo.id}`,
        kind: "combo",
        id: combo.id,
        name: combo.name,
        cat: "Combo Pack",
        mrp: combo.mrp,
        sale: priced.effectiveSale,
        img: combo.imagePath || "",
        qty: item.qty,
        slug: combo.slug,
      });
    }
  }

  if (!lines.length) return { lines: [], error: "Cart is empty." };
  return { lines };
}

/** Admin/customer-account view — never drop the whole cart because of stock or inactive flags. */
export async function resolveCartLinesAdmin(
  items: CartInput[]
): Promise<{ lines: CartLine[]; warnings: string[] }> {
  if (!items.length) return { lines: [], warnings: [] };

  const offers = await getActiveOffers();
  const lines: CartLine[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    if (item.qty <= 0) continue;

    if (item.kind === "product") {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      });
      if (!product) {
        warnings.push(`Product no longer in catalogue (${item.id})`);
        continue;
      }
      if (!product.active) warnings.push(`${product.name} is inactive`);
      if (product.stock < item.qty) {
        warnings.push(`${product.name}: only ${product.stock} in stock (cart has ${item.qty})`);
      }
      const priced = priceProduct(product, offers);
      lines.push({
        key: `product:${product.id}`,
        kind: "product",
        id: product.id,
        name: product.name,
        cat: product.category.name,
        mrp: product.mrp,
        sale: priced.effectiveSale,
        img: coverPath(product),
        qty: item.qty,
        slug: product.slug,
      });
    } else {
      const combo = await prisma.comboPack.findUnique({ where: { id: item.id } });
      if (!combo) {
        warnings.push(`Combo no longer in catalogue (${item.id})`);
        continue;
      }
      if (!combo.active) warnings.push(`${combo.name} is inactive`);
      const priced = priceCombo(combo, offers);
      lines.push({
        key: `combo:${combo.id}`,
        kind: "combo",
        id: combo.id,
        name: combo.name,
        cat: "Combo Pack",
        mrp: combo.mrp,
        sale: priced.effectiveSale,
        img: combo.imagePath || "",
        qty: item.qty,
        slug: combo.slug,
      });
    }
  }

  return { lines, warnings };
}

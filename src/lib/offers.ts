import { prisma } from "./prisma";

export type ActiveOffer = {
  id: string;
  pct: number;
  appliesTo: "ALL" | "CATEGORY" | "COMBOS";
  categoryId: string | null;
};

export async function getActiveOffers(): Promise<ActiveOffer[]> {
  const now = new Date();
  const rows = await prisma.offer.findMany({
    where: { status: "active", startDate: { lte: now }, endDate: { gte: now } },
    select: { id: true, pct: true, appliesTo: true, categoryId: true },
  });
  return rows;
}

/** Round to nearest ₹5 like the prototype */
export function roundPrice(amount: number) {
  return Math.max(0, Math.round(amount / 5) * 5);
}

/** Apply campaign % on MRP, then take the better of base sale vs offer sale */
export function effectiveSalePrice(mrp: number, baseSale: number, offerPct: number) {
  if (offerPct <= 0) return baseSale;
  const fromOffer = roundPrice(mrp * (1 - offerPct / 100));
  return Math.min(baseSale, fromOffer);
}

export function bestProductOfferPct(offers: ActiveOffer[], categoryId: string) {
  let best = 0;
  for (const o of offers) {
    if (o.appliesTo === "ALL") best = Math.max(best, o.pct);
    if (o.appliesTo === "CATEGORY" && o.categoryId === categoryId) best = Math.max(best, o.pct);
  }
  return best;
}

export function bestComboOfferPct(offers: ActiveOffer[]) {
  let best = 0;
  for (const o of offers) {
    if (o.appliesTo === "ALL" || o.appliesTo === "COMBOS") best = Math.max(best, o.pct);
  }
  return best;
}

export function priceProduct<T extends { mrp: number; salePrice: number; categoryId: string }>(
  product: T,
  offers: ActiveOffer[]
) {
  const pct = bestProductOfferPct(offers, product.categoryId);
  return {
    ...product,
    offerPct: pct,
    effectiveSale: effectiveSalePrice(product.mrp, product.salePrice, pct),
  };
}

export function priceCombo<T extends { mrp: number; salePrice: number }>(combo: T, offers: ActiveOffer[]) {
  const pct = bestComboOfferPct(offers);
  return {
    ...combo,
    offerPct: pct,
    effectiveSale: effectiveSalePrice(combo.mrp, combo.salePrice, pct),
  };
}

import { prisma } from "./prisma";

export type SiteSettings = {
  businessName: string;
  tagline: string;
  gstin: string;
  license: string;
  address: string;
  cityLine: string;
  phone: string;
  phone2: string;
  whatsapp: string;
  email: string;
  hours: string;
  mapEmbed: string;
  marquee: string;
  gstPercent: number;
  packingCharge: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  businessName: "Sri Pathra Pyro World",
  tagline: "ALL KINDS OF CRACKERS & FANCY VARIETIES",
  gstin: "33AFRFS8857B1ZJ",
  license: "TN/VIR/EXP/0857/2025",
  address: "3/178C, Kalayarkurichi, Purnachandrapuram, Virudhunagar, Tamil Nadu – 626130",
  cityLine: "Kalayarkurichi, Purnachandrapuram – 626130",
  phone: "+91 98432 11234",
  phone2: "+91 89039 45671",
  whatsapp: "+91 98432 11234",
  email: "sripathrapyroworld@gmail.com",
  hours: "Mon–Sat: 9:00 AM – 8:30 PM · Sun: 10:00 AM – 6:00 PM",
  mapEmbed:
    "https://www.openstreetmap.org/export/embed.html?bbox=77.93%2C9.56%2C77.97%2C9.60&layer=mapnik&marker=9.5810%2C77.9502",
  marquee: "🪔 Genuine Sivakasi Crackers — Direct Factory Rate — Licensed PESO Dealer — Safe Parcel Delivery Across Tamil Nadu 🪔",
  gstPercent: 18,
  packingCharge: 0,
};

export async function getSettings(): Promise<SiteSettings> {
  const row = await prisma.setting.findUnique({ where: { id: "main" } });
  if (!row) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(row.data) as Partial<SiteSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      gstPercent: Math.max(0, Number(parsed.gstPercent ?? DEFAULT_SETTINGS.gstPercent) || 0),
      packingCharge: Math.max(0, Math.round(Number(parsed.packingCharge ?? DEFAULT_SETTINGS.packingCharge) || 0)),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(data: SiteSettings) {
  await prisma.setting.upsert({
    where: { id: "main" },
    update: { data: JSON.stringify(data) },
    create: { id: "main", data: JSON.stringify(data) },
  });
}

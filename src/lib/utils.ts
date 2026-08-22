export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function discountPct(mrp: number, sale: number) {
  if (!mrp || sale >= mrp) return 0;
  return Math.round((1 - sale / mrp) * 100);
}

export function stockStatus(stock: number) {
  if (stock <= 0) return { key: "out" as const, label: "Out of Stock" };
  if (stock <= 15) return { key: "low" as const, label: `Low Stock · ${stock}` };
  return { key: "instock" as const, label: `In Stock · ${stock}` };
}

export function waDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export function waLink(phone: string, text?: string) {
  const base = `https://wa.me/${waDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function mediaUrl(path?: string | null) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("/")) return path;
  const clean = path.replace(/^\/+/, "");
  // Seed SVGs are shipped in /public/media (reliable on Netlify)
  if (clean.endsWith(".svg")) return `/media/${clean}`;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
    process.env.SUPABASE_STORAGE_BUCKET ||
    "uploads";
  if (base) {
    return `${base.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${clean}`;
  }
  return `/media/${clean}`;
}

export function nextOrderNumber(last?: string | null) {
  if (!last) return "SPW1001";
  const n = parseInt(last.replace(/\D/g, ""), 10);
  return `SPW${String(Number.isFinite(n) ? n + 1 : 1001).padStart(4, "0")}`;
}

export function formatOrderChannel(channel: string) {
  if (channel === "Website") return "Online";
  return "Offline";
}

export function isOfflineOrder(channel: string) {
  return channel !== "Website";
}

export const SHIPMENT_STEPS = [
  { key: "placed", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "dispatched", label: "Dispatched" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
] as const;

export type CartLine = {
  key: string;
  kind: "product" | "combo";
  id: string;
  name: string;
  cat: string;
  mrp: number;
  sale: number;
  img: string;
  qty: number;
  slug?: string;
};

export type CartFees = {
  gstPercent?: number;
  packingCharge?: number;
  shippingCharge?: number;
  /** When true, packing & shipping are excluded (awaiting admin quote). */
  feesPending?: boolean;
};

export function cartTotals(items: CartLine[], fees: CartFees = {}) {
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.sale * i.qty, 0);
  const orig = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const gstPercent = Math.max(0, Number(fees.gstPercent) || 0);
  const feesPending = Boolean(fees.feesPending);
  const packingCharge = feesPending ? 0 : Math.max(0, Math.round(Number(fees.packingCharge) || 0));
  const shippingCharge = feesPending ? 0 : Math.max(0, Math.round(Number(fees.shippingCharge) || 0));
  const gstAmount = Math.round(subtotal * gstPercent / 100);
  const total = subtotal + gstAmount + packingCharge + shippingCharge;
  return {
    count,
    subtotal,
    savings: orig - subtotal,
    orig,
    gstPercent,
    gstAmount,
    packingCharge,
    shippingCharge,
    feesPending,
    total,
  };
}

export type CartTotals = ReturnType<typeof cartTotals>;

export function loginPath(from?: string) {
  const dest = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";
  return `/login?from=${encodeURIComponent(dest)}`;
}

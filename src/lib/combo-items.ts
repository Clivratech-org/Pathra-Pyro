export type ComboProductLine = {
  id: string;
  name: string;
  qty: number;
};

export type ComboItemsData = {
  products: ComboProductLine[];
  extras: string[];
};

export function parseComboItems(raw: string): ComboItemsData {
  try {
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) {
      if (parsed.every((x) => typeof x === "string")) {
        return { products: [], extras: parsed as string[] };
      }
      const products: ComboProductLine[] = [];
      const extras: string[] = [];
      for (const item of parsed) {
        if (item && typeof item === "object" && item.id && item.name) {
          products.push({
            id: String(item.id),
            name: String(item.name),
            qty: Math.max(1, Number(item.qty) || 1),
          });
        } else if (typeof item === "string") {
          extras.push(item);
        }
      }
      return { products, extras };
    }
    if (parsed && typeof parsed === "object") {
      return {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        extras: Array.isArray(parsed.extras) ? parsed.extras : [],
      };
    }
  } catch {
    /* ignore */
  }
  return { products: [], extras: [] };
}

export function serializeComboItems(data: ComboItemsData) {
  const lines = [
    ...data.products.map((p) => ({ id: p.id, name: p.name, qty: p.qty })),
    ...data.extras,
  ];
  return JSON.stringify(lines);
}

export function comboItemsAsLabels(raw: string): string[] {
  const { products, extras } = parseComboItems(raw);
  return [
    ...products.map((p) => (p.qty > 1 ? `${p.name} × ${p.qty}` : p.name)),
    ...extras,
  ];
}

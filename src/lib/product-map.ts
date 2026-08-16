import type { ProductCardData } from "@/components/product-card";

export type ProductWithRelations = {
  id: string;
  name: string;
  slug: string;
  mrp: number;
  salePrice: number;
  categoryId: string;
  images: { isCover: boolean; path: string }[];
  category: { name: string };
};

export function toCard(p: ProductWithRelations, saleOverride?: number): ProductCardData {
  const cover = p.images.find((i) => i.isCover) || p.images[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    cat: p.category.name,
    mrp: p.mrp,
    sale: saleOverride ?? p.salePrice,
    img: cover?.path || "",
  };
}

export function coverPath(p: { images: { isCover: boolean; path: string }[] }) {
  return (p.images.find((i) => i.isCover) || p.images[0])?.path || "";
}

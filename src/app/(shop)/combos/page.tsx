import { ComboCard } from "@/components/combo-card";
import { fetchPricedCombos } from "@/lib/catalog";

export default async function CombosPage() {
  const combos = await fetchPricedCombos();
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <div className="crumb">Home / <span>Combo Packs</span></div>
          <div className="eyebrow">Bundled & Best Value</div>
          <h1>Diwali Combo Packs</h1>
          <p>Curated tiers built for every family size and budget — each pack shows exactly what&apos;s included.</p>
        </div>
      </div>
      <section style={{ paddingTop: 40 }}>
        <div className="wrap grid-3">
          {combos.map((c) => (
            <ComboCard
              key={c.id}
              c={{
                id: c.id,
                slug: c.slug,
                tier: c.tier,
                name: c.name,
                items: JSON.parse(c.itemsJson) as string[],
                mrp: c.mrp,
                sale: c.effectiveSale,
                img: c.imagePath,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}

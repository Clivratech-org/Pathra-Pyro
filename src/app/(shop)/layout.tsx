import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { AuthSession } from "@/components/auth-session";
import { CartProvider } from "@/components/cart-provider";
import { FloatingActions } from "@/components/floating-actions";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { Toast } from "@/components/toast";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

const getCachedSettings = unstable_cache(async () => getSettings(), ["site-settings"], {
  revalidate: 60,
  tags: ["site-settings"],
});

const getNavCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
  ["shop-nav-categories"],
  { revalidate: 120, tags: ["categories"] }
);

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [session, settings, categories] = await Promise.all([
    auth(),
    getCachedSettings(),
    getNavCategories(),
  ]);

  return (
    <AuthSession>
      <CartProvider userId={session?.user?.role === "CUSTOMER" ? session.user.id : null}>
        <div className="bg-glow" />
        <div className="grain" />
        <PublicHeader
          settings={settings}
          userName={session?.user?.role === "CUSTOMER" ? session.user.name : null}
        />
        {children}
        <PublicFooter settings={settings} categories={categories} />
        <FloatingActions phone={settings.phone} whatsapp={settings.whatsapp} />
        <Toast />
      </CartProvider>
    </AuthSession>
  );
}

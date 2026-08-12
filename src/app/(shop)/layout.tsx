import { auth } from "@/auth";
import { AuthSession } from "@/components/auth-session";
import { CartProvider } from "@/components/cart-provider";
import { FloatingActions } from "@/components/floating-actions";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { Toast } from "@/components/toast";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [session, settings, categories] = await Promise.all([
    auth(),
    getSettings(),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true } }),
  ]);

  return (
    <AuthSession>
    <CartProvider userId={session?.user?.role === "CUSTOMER" ? session.user.id : null}>
      <div className="bg-glow" />
      <div className="grain" />
      <PublicHeader settings={settings} userName={session?.user?.role === "CUSTOMER" ? session.user.name : null} />
      {children}
      <PublicFooter settings={settings} categories={categories} />
      <FloatingActions phone={settings.phone} whatsapp={settings.whatsapp} />
      <Toast />
    </CartProvider>
    </AuthSession>
  );
}

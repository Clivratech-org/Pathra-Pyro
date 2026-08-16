import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminLogout } from "@/components/admin-logout";
import { AdminShell } from "@/components/admin-shell";

const getNewLeadCount = unstable_cache(
  async () => prisma.lead.count({ where: { status: "new" } }),
  ["admin-new-leads"],
  { revalidate: 30, tags: ["leads"] }
);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session, leadCount] = await Promise.all([auth(), getNewLeadCount()]);
  return (
    <AdminShell
      adminName={session?.user?.name || "Admin"}
      leadCount={leadCount}
      logout={<AdminLogout />}
    >
      {children}
    </AdminShell>
  );
}

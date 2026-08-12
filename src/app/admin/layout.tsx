import { auth } from "@/auth";
import { AdminLogout } from "@/components/admin-logout";
import { AdminShell } from "@/components/admin-shell";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const leadCount = await prisma.lead.count({ where: { status: "new" } });
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

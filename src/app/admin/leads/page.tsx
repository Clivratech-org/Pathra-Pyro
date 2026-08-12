import { LeadsClient } from "@/components/leads-client";
import { prisma } from "@/lib/prisma";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { lastContact: "desc" } });
  return (
    <LeadsClient
      leads={leads.map((l) => ({
        ...l,
        lastContact: l.lastContact.toISOString(),
      }))}
    />
  );
}

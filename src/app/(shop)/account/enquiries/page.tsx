import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account-nav";

export default async function EnquiriesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") redirect("/login?from=/account/enquiries");
  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <div className="wrap account-grid">
        <AccountNav />
        <div>
          <h2 style={{ marginBottom: 18 }}>My Enquiries</h2>
          {leads.length === 0 ? (
            <div className="card static empty-cart">
              <p>No enquiries yet.</p>
              <Link className="btn btn-primary" href="/contact" style={{ marginTop: 16 }}>
                Send an enquiry
              </Link>
            </div>
          ) : (
            <div className="card table-wrap static">
              <table className="data">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Interest</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td>{l.createdAt.toLocaleDateString("en-IN")}</td>
                      <td>{l.source}</td>
                      <td>{l.interest}</td>
                      <td>
                        <span className={`pill ${l.status}`}>{l.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

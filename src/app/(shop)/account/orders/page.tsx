import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/utils";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account-nav";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { shipment: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <div className="wrap account-grid">
        <AccountNav />
        <div>
          <h2 style={{ marginBottom: 18 }}>My Orders</h2>
          {orders.length === 0 ? (
            <div className="card static empty-cart">
              <p>No orders yet.</p>
              <Link className="btn btn-primary" href="/shop" style={{ marginTop: 16 }}>Shop now</Link>
            </div>
          ) : (
            <div className="card table-wrap static">
              <table className="data">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>
                      <td>{o.createdAt.toLocaleDateString("en-IN")}</td>
                      <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                      <td>{formatInr(o.total)}</td>
                      <td><span className={`pill ${o.paymentStatus}`}>{o.paymentStatus}</span></td>
                      <td><span className={`pill ${o.shipment?.status}`}>{o.shipment?.status}</span></td>
                      <td><Link href={`/track/${o.orderNumber}`}>Track</Link></td>
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

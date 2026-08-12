import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/utils";

export default async function AdminDashboard() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const [orders, leads, lowStock, recentLeads, recentOrders] = await Promise.all([
    prisma.order.findMany({ include: { items: true } }),
    prisma.lead.findMany(),
    prisma.product.count({ where: { stock: { lte: 15 } } }),
    prisma.lead.findMany({ orderBy: { lastContact: "desc" }, take: 4 }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const sales = paid.reduce((s, o) => s + o.total, 0);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekAgo.getTime() + i * 86400000);
    const total = paid
      .filter((o) => o.createdAt.toDateString() === d.toDateString())
      .reduce((s, o) => s + o.total, 0);
    return { label: days[d.getDay()], total };
  });
  const max = Math.max(...week.map((d) => d.total), 1);

  return (
    <>
      <div className="kpi-grid">
        <div className="card kpi static">
          <div className="ic">💰</div>
          <div className="val">{formatInr(sales)}</div>
          <div className="lbl">Total Sales</div>
        </div>
        <div className="card kpi static">
          <div className="ic">🧾</div>
          <div className="val">{orders.length}</div>
          <div className="lbl">Total Orders</div>
        </div>
        <div className="card kpi static">
          <div className="ic">🧲</div>
          <div className="val">{leads.filter((l) => l.status === "new" || l.status === "contacted").length}</div>
          <div className="lbl">Active Leads</div>
        </div>
        <div className="card kpi static">
          <div className="ic">📦</div>
          <div className="val">{lowStock}</div>
          <div className="lbl">Low Stock Items</div>
          <span className="delta down">needs restock</span>
        </div>
      </div>
      <div className="dash-grid">
        <div className="card panel static">
          <div className="panel-head"><h3>Sales — Last 7 Days</h3></div>
          <div className="bar-chart">
            {week.map((d) => (
              <div className="col" key={d.label}>
                <div className="bar" style={{ height: `${(d.total / max) * 100}%` }} title={formatInr(d.total)} />
                <div className="lbl">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card panel static">
          <div className="panel-head"><h3>Orders by payment</h3></div>
          <div className="legend" style={{ display: "grid", gap: 10 }}>
            <div>Paid — {paid.length}</div>
            <div>Pending — {orders.filter((o) => o.paymentStatus === "pending").length}</div>
            <div>Failed — {orders.filter((o) => o.paymentStatus === "failed").length}</div>
          </div>
        </div>
      </div>
      <div className="dash-grid" style={{ marginTop: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card panel static">
          <div className="panel-head">
            <h3>Recent Leads</h3>
            <Link href="/admin/leads" className="cell-sub">View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Name</th><th>Interest</th><th>Status</th></tr></thead>
              <tbody>
                {recentLeads.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}<div className="cell-sub">{l.phone}</div></td>
                    <td>{l.interest}</td>
                    <td><span className={`pill ${l.status}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card panel static">
          <div className="panel-head">
            <h3>Recent Orders</h3>
            <Link href="/admin/sales" className="cell-sub">View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Order</th><th>Customer</th><th>Amount</th></tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customerName}</td>
                    <td>{formatInr(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

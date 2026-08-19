import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/utils";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pay?: string }>;
}) {
  const { q = "", pay = "all" } = await searchParams;
  const orders = await prisma.order.findMany({
    where: {
      ...(pay !== "all" ? { paymentStatus: pay as "paid" | "pending" | "failed" | "refunded" } : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q } },
              { customerName: { contains: q } },
              { customerPhone: { contains: q } },
            ],
          }
        : {}),
    },
    include: { items: true, shipment: true },
    orderBy: { createdAt: "desc" },
  });
  const all = await prisma.order.findMany({ include: { items: true } });
  const paid = all.filter((o) => o.paymentStatus === "paid");
  const avg = paid.length ? Math.round(paid.reduce((s, o) => s + o.total, 0) / paid.length) : 0;

  return (
    <>
      <div className="kpi-grid">
        <div className="card kpi static"><div className="ic">🧾</div><div className="val">{all.length}</div><div className="lbl">Total Orders</div></div>
        <div className="card kpi static"><div className="ic">✅</div><div className="val">{paid.length}</div><div className="lbl">Paid Orders</div></div>
        <div className="card kpi static"><div className="ic">⏳</div><div className="val">{all.filter((o) => o.paymentStatus === "pending").length}</div><div className="lbl">Pending Payment</div></div>
        <div className="card kpi static"><div className="ic">💵</div><div className="val">{formatInr(avg)}</div><div className="lbl">Avg. Order Value</div></div>
      </div>
      <div className="toolbar">
        <form className="search-box2">
          <input name="q" defaultValue={q} placeholder="Search order ID or customer…" />
        </form>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "paid", "pending"].map((s) => (
            <Link key={s} href={`/admin/sales?pay=${s}`} className={`chip-f${pay === s ? " active" : ""}`}>
              {s[0].toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
        <a className="btn btn-outline" href="/api/admin/sales.csv">⬇ Export CSV</a>
      </div>
      <div className="card table-wrap static">
        <table className="data">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Channel</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.orderNumber}</td>
                <td>{o.customerName}<div className="cell-sub">{o.customerPhone}</div></td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)} items</td>
                <td>{formatInr(o.total)}</td>
                <td><span className={`pill ${o.paymentStatus}`}>{o.paymentStatus}</span></td>
                <td><span className="cell-sub">{o.channel}</span></td>
                <td><span className="cell-sub">{o.createdAt.toLocaleDateString("en-IN")}</span></td>
                <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Link className="icon-mini" href={`/admin/orders/${o.id}`} title="View">👁</Link>
                  <a className="icon-mini" href={`/api/orders/${o.id}/invoice`} title="Invoice PDF">🧾</a>
                  <a className="icon-mini" href={`/api/admin/orders/${o.id}/checklist`} title="Checklist PDF">☑</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

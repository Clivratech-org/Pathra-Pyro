import Link from "next/link";
import { notFound } from "next/navigation";
import { saveLead } from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { resolveCartLinesAdmin } from "@/lib/checkout";
import { getSettings } from "@/lib/settings";
import { cartTotals, formatInr, mediaUrl, waLink } from "@/lib/utils";
import { TotalsBreakdown } from "@/components/totals-breakdown";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [customer, settings] = await Promise.all([
    prisma.user.findFirst({
      where: { id, role: "CUSTOMER" },
      include: {
        cartItems: true,
        orders: { include: { items: true, shipment: true }, orderBy: { createdAt: "desc" } },
        leads: { orderBy: { createdAt: "desc" } },
      },
    }),
    getSettings(),
  ]);
  if (!customer) notFound();

  const raw = customer.cartItems
    .map((r) => {
      if (r.productId) return { kind: "product" as const, id: r.productId, qty: r.qty };
      if (r.comboId) return { kind: "combo" as const, id: r.comboId, qty: r.qty };
      return null;
    })
    .filter(Boolean) as { kind: "product" | "combo"; id: string; qty: number }[];
  const { lines, warnings } = raw.length ? await resolveCartLinesAdmin(raw) : { lines: [], warnings: [] };
  const cartQty = customer.cartItems.reduce((s, i) => s + i.qty, 0);
  const totals = cartTotals(lines, { gstPercent: settings.gstPercent, packingCharge: settings.packingCharge });

  return (
    <div style={{ display: "grid", gap: 22 }} className="editor-split">
      <div className="card panel static">
        <div className="panel-head">
          <h3>{customer.name}</h3>
          <a className="btn btn-sm btn-outline" href={waLink(customer.phone)} target="_blank" rel="noreferrer">
            WhatsApp customer
          </a>
        </div>
        <p>{customer.phone}{customer.email ? ` · ${customer.email}` : ""}</p>
        <p className="cell-sub">{customer.address || "No address on file"} {customer.pincode || ""}</p>
        <p className="cell-sub" style={{ marginTop: 8 }}>
          Joined {customer.createdAt.toLocaleDateString("en-IN")}
        </p>
      </div>

      <div className="card panel static">
        <h3 style={{ marginBottom: 14 }}>
          Live cart
          {cartQty > 0 && <span className="pill new" style={{ marginLeft: 8 }}>{cartQty} items</span>}
        </h3>
        {lines.length === 0 ? (
          <p className="cell-sub">
            {cartQty > 0
              ? "Cart has saved items but they could not be loaded. Check product catalogue."
              : "Cart is empty."}
          </p>
        ) : (
          <>
            {warnings.length > 0 && (
              <div className="alert error" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
                {warnings.join(" · ")}
              </div>
            )}
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((i) => (
                    <tr key={i.key}>
                      <td>
                        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <img src={mediaUrl(i.img)} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                          {i.name}
                        </span>
                        <div className="cell-sub">{i.cat}</div>
                      </td>
                      <td>{i.qty}</td>
                      <td>{formatInr(i.sale * i.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ maxWidth: 320, marginLeft: "auto", marginTop: 12 }}>
              <TotalsBreakdown totals={totals} />
            </div>
          </>
        )}
      </div>

      <div className="card panel static">
        <h3 style={{ marginBottom: 14 }}>Orders</h3>
        {customer.orders.length === 0 ? (
          <p className="cell-sub">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Shipment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customer.orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.createdAt.toLocaleDateString("en-IN")}</td>
                    <td>{formatInr(o.total)}</td>
                    <td><span className={`pill ${o.paymentStatus}`}>{o.paymentStatus}</span></td>
                    <td><span className={`pill ${o.shipment?.status}`}>{o.shipment?.status}</span></td>
                    <td>
                      <Link className="icon-mini" href={`/admin/orders/${o.id}`}>👁</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card panel static">
        <h3 style={{ marginBottom: 14 }}>Enquiries</h3>
        {customer.leads.length === 0 ? (
          <p className="cell-sub">No enquiries yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customer.leads.map((l) => (
                  <tr key={l.id}>
                    <td>{l.createdAt.toLocaleString("en-IN")}</td>
                    <td>{l.source}</td>
                    <td>
                      <strong>{l.interest}</strong>
                      {l.notes && (
                        <div className="cell-sub" style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>
                          {l.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <form
                        action={async (fd) => {
                          "use server";
                          await saveLead(fd);
                        }}
                        className="lead-status-form"
                      >
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="name" value={l.name} />
                        <input type="hidden" name="phone" value={l.phone} />
                        <input type="hidden" name="interest" value={l.interest} />
                        <input type="hidden" name="source" value={l.source} />
                        <input type="hidden" name="notes" value={l.notes} />
                        <select name="status" defaultValue={l.status} className="chip-f">
                          <option value="new">new</option>
                          <option value="contacted">contacted</option>
                          <option value="converted">converted</option>
                          <option value="lost">lost</option>
                        </select>
                        <button className="btn btn-sm btn-outline" type="submit">Update</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

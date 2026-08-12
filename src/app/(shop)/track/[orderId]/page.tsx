import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr, mediaUrl, SHIPMENT_STEPS } from "@/lib/utils";

export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const { orderId } = await params;
  const { phone } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { orderNumber: orderId.toUpperCase() },
    include: {
      items: true,
      shipment: { include: { events: { orderBy: { createdAt: "asc" } }, photos: { orderBy: { createdAt: "asc" } } } },
    },
  });

  if (!order) {
    return (
      <section>
        <div className="wrap">
          <div className="card static empty-cart">
            <h3>Order not found</h3>
            <p>Check the ID and try again.</p>
            <Link className="btn btn-primary" href="/track" style={{ marginTop: 16 }}>Back to tracking</Link>
          </div>
        </div>
      </section>
    );
  }

  const last10 = order.customerPhone.replace(/\D/g, "").slice(-10);
  if (phone && phone.slice(-10) !== last10) {
    return (
      <section>
        <div className="wrap">
          <div className="card static empty-cart">
            <h3>Phone does not match</h3>
            <p>Use the mobile number entered at checkout.</p>
            <Link className="btn btn-primary" href="/track" style={{ marginTop: 16 }}>Try again</Link>
          </div>
        </div>
      </section>
    );
  }

  const status = order.shipment?.status || "placed";
  const idx = SHIPMENT_STEPS.findIndex((s) => s.key === status);
  const cancelled = status === "cancelled";

  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <div className="crumb">Home / Track / <span>{order.orderNumber}</span></div>
          <div className="eyebrow">Live tracking</div>
          <h1>Order {order.orderNumber}</h1>
          <p>
            {order.customerName} · {formatInr(order.total)} · Payment {order.paymentStatus}
          </p>
        </div>
      </div>
      <section style={{ paddingTop: 40 }}>
        <div className="wrap" style={{ display: "grid", gap: 28, gridTemplateColumns: "1.2fr 0.8fr" }}>
          <div className="card static" style={{ padding: 28 }}>
            <h3>Shipment status</h3>
            {cancelled ? (
              <p className="alert error" style={{ marginTop: 16 }}>This order was cancelled.</p>
            ) : (
              <div className="timeline" style={{ marginTop: 22 }}>
                {SHIPMENT_STEPS.map((step, i) => (
                  <div className={`timeline-step${i <= idx ? " done" : ""}`} key={step.key}>
                    <div className="dotcol">
                      <div className="dot" />
                      {i < SHIPMENT_STEPS.length - 1 && <div className="line" />}
                    </div>
                    <div style={{ paddingBottom: 18 }}>
                      <strong>{step.label}</strong>
                      {order.shipment?.events
                        .filter((e) => e.status === step.key)
                        .map((e) => (
                          <div className="cell-sub" key={e.id}>
                            {e.createdAt.toLocaleString("en-IN")} {e.note && `· ${e.note}`}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {order.shipment?.photos.length ? (
              <>
                <h3 style={{ marginTop: 12 }}>Packing & courier photos</h3>
                <div className="track-photos">
                  {order.shipment.photos.map((p) => (
                    <figure key={p.id}>
                      <img src={mediaUrl(p.path)} alt={p.caption} />
                      <figcaption>
                        {p.caption || p.stage} · {p.createdAt.toLocaleDateString("en-IN")}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </>
            ) : (
              <p className="cell-sub" style={{ marginTop: 12 }}>Photos will appear here once the warehouse uploads packing and courier images.</p>
            )}
          </div>
          <div className="card summary-card">
            <h4>Items</h4>
            {order.items.map((i) => (
              <div className="summary-line" key={i.id}>
                <span>{i.name} × {i.qty}</span>
                <span className="amt">{formatInr(i.salePrice * i.qty)}</span>
              </div>
            ))}
            <div className="summary-line total">
              <span>Total</span>
              <span className="amt">{formatInr(order.total)}</span>
            </div>
            <p className="cell-sub" style={{ marginTop: 12 }}>{order.address}, {order.pincode}</p>
          </div>
        </div>
      </section>
    </>
  );
}

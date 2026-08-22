import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatInr, formatOrderChannel } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { PrintButton } from "@/components/print-button";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) notFound();

  return (
    <div className="card static invoice-sheet">
      <div className="invoice-actions no-print">
        <a className="btn btn-primary" href={`/api/orders/${order.id}/invoice`}>
          Download PDF
        </a>
        <PrintButton />
      </div>
      <div className="invoice-head">
        <div className="invoice-brand">
          <img src="/images/logo.png" alt={settings.businessName} />
          <div>
            <h2>{settings.businessName}</h2>
            <p>{settings.address}</p>
            <p>GSTIN {settings.gstin} · License {settings.license}</p>
          </div>
        </div>
        <div className="invoice-meta">
          <strong>TAX INVOICE</strong>
          <div>{order.orderNumber}</div>
          <div>{order.createdAt.toLocaleDateString("en-IN")}</div>
        </div>
      </div>
      <p>
        <strong>Bill to:</strong> {order.customerName}
        <br />
        {order.customerPhone}
        <br />
        {order.address} {order.pincode}
      </p>
      <table className="data" style={{ marginTop: 20, minWidth: 0 }}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id}>
              <td style={{ color: "#1a1010" }}>{i.name}</td>
              <td style={{ color: "#1a1010" }}>{i.qty}</td>
              <td style={{ color: "#1a1010" }}>{formatInr(i.salePrice)}</td>
              <td style={{ color: "#1a1010" }}>{formatInr(i.salePrice * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ textAlign: "right", marginTop: 16 }}>
        Subtotal {formatInr(order.subtotal)}
        <br />
        {order.gstAmount > 0 && (
          <>
            GST ({order.gstPercent}%) {formatInr(order.gstAmount)}
            <br />
          </>
        )}
        {order.packingCharge > 0 && (
          <>
            Packing {formatInr(order.packingCharge)}
            <br />
          </>
        )}
        {order.shippingCharge > 0 && (
          <>
            Shipping {formatInr(order.shippingCharge)}
            <br />
          </>
        )}
        <strong>Grand Total {formatInr(order.total)}</strong>
      </p>
      <p style={{ fontSize: "0.8rem", marginTop: 24 }}>
        Payment: {order.paymentStatus} · Channel: {formatOrderChannel(order.channel)}
      </p>
    </div>
  );
}

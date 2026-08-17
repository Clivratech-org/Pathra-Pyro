import { formatInr, type CartTotals } from "@/lib/utils";

export function TotalsBreakdown({
  totals,
  savingsLabel = "You Save",
  totalLabel = "Grand Total",
  showPendingNote = true,
}: {
  totals: CartTotals;
  savingsLabel?: string;
  totalLabel?: string;
  showPendingNote?: boolean;
}) {
  return (
    <>
      <div className="summary-line">
        <span>{totals.count} items</span>
        <span className="amt">{formatInr(totals.subtotal)}</span>
      </div>
      {totals.savings > 0 && (
        <div className="summary-line">
          <span>{savingsLabel}</span>
          <span className="amt">{formatInr(totals.savings)}</span>
        </div>
      )}
      {totals.gstPercent > 0 && (
        <div className="summary-line">
          <span>GST ({totals.gstPercent}%)</span>
          <span className="amt">{formatInr(totals.gstAmount)}</span>
        </div>
      )}
      {totals.feesPending ? (
        showPendingNote && (
          <div className="summary-line summary-pending">
            <span>Packing &amp; shipping</span>
            <span className="amt">Quoted after enquiry</span>
          </div>
        )
      ) : (
        <>
          {totals.packingCharge > 0 && (
            <div className="summary-line">
              <span>Packing charges</span>
              <span className="amt">{formatInr(totals.packingCharge)}</span>
            </div>
          )}
          {totals.shippingCharge > 0 && (
            <div className="summary-line">
              <span>Shipping charges</span>
              <span className="amt">{formatInr(totals.shippingCharge)}</span>
            </div>
          )}
        </>
      )}
      <div className="summary-line total">
        <span>{totalLabel}</span>
        <span className="amt">{formatInr(totals.total)}</span>
      </div>
      {totals.feesPending && showPendingNote && (
        <p className="summary-footnote">Final total includes packing &amp; shipping once our team confirms your quote.</p>
      )}
    </>
  );
}

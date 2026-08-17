import { formatInr, type CartTotals } from "@/lib/utils";

export function TotalsBreakdown({
  totals,
  savingsLabel = "You Save",
  totalLabel = "Grand Total",
}: {
  totals: CartTotals;
  savingsLabel?: string;
  totalLabel?: string;
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
      {totals.packingCharge > 0 && (
        <div className="summary-line">
          <span>Packing charges</span>
          <span className="amt">{formatInr(totals.packingCharge)}</span>
        </div>
      )}
      <div className="summary-line total">
        <span>{totalLabel}</span>
        <span className="amt">{formatInr(totals.total)}</span>
      </div>
    </>
  );
}

"use client";

export function PrintButton() {
  return (
    <button className="btn btn-outline no-print" type="button" onClick={() => window.print()}>
      Print
    </button>
  );
}

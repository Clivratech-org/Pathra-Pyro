"use client";

export function PrintButton() {
  return (
    <button className="btn btn-primary no-print" type="button" onClick={() => window.print()} style={{ marginTop: 20 }}>
      Print
    </button>
  );
}

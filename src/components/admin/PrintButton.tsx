"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn-accent no-print" onClick={() => window.print()}>
      🖨 Print / Save as PDF
    </button>
  );
}

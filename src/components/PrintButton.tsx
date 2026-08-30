'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="neon-btn-blue !text-sm print:hidden"
    >
      🖨️ Print
    </button>
  );
}

"use client";

import { EstimatePaper, InvoicePaper } from "../utils/pdf";

export default function PrintLayer({ printDoc, shouldPrint, company }) {
  if (!printDoc || !shouldPrint) return null;

  return (
    <div className="print-only" aria-hidden="true">
      <div className="paper">
        {printDoc.type === "invoice" ? (
          <InvoicePaper estimate={printDoc.estimate} company={company} />
        ) : (
          <EstimatePaper estimate={printDoc.estimate} company={company} />
        )}
      </div>
    </div>
  );
}

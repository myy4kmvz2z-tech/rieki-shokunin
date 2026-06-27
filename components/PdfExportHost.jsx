"use client";

import { EstimatePaper, InvoicePaper } from "../utils/pdf";

export default function PdfExportHost({ estimate, type, company }) {
  if (!estimate || !type) return null;

  return (
    <div className="pdf-export-host" aria-hidden="true">
      <div className="paper">
        {type === "invoice" ? (
          <InvoicePaper estimate={estimate} company={company} />
        ) : (
          <EstimatePaper estimate={estimate} company={company} />
        )}
      </div>
    </div>
  );
}

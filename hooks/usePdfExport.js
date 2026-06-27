"use client";

import { useCallback, useState } from "react";
import { createPdfDocument } from "../utils/pdfExport";

export function usePdfExport(company) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(
    async (estimate, type) => {
      if (isGenerating) {
        throw new Error("PDF生成中です。");
      }

      setIsGenerating(true);
      try {
        return await createPdfDocument({ estimate, type, company });
      } finally {
        setIsGenerating(false);
      }
    },
    [company, isGenerating]
  );

  return {
    isGenerating,
    generatePdf,
  };
}

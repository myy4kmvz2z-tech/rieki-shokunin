"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPdfFromHost } from "../utils/pdfExport";

export function usePdfExport(company) {
  const hostRef = useRef(null);
  const [exportJob, setExportJob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!exportJob) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const result = await createPdfFromHost(
          hostRef.current,
          exportJob.type,
          exportJob.estimate.siteName
        );
        if (!cancelled) {
          exportJob.resolve(result);
        }
      } catch (error) {
        if (!cancelled) {
          exportJob.reject(error);
        }
      } finally {
        if (!cancelled) {
          setExportJob(null);
          setIsGenerating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [exportJob]);

  const generatePdf = useCallback(
    async (estimate, type) => {
      if (isGenerating) {
        throw new Error("PDF生成中です。");
      }

      setIsGenerating(true);

      return new Promise((resolve, reject) => {
        setExportJob({ estimate, type, resolve, reject });
      });
    },
    [isGenerating]
  );

  return {
    hostRef,
    exportEstimate: exportJob?.estimate ?? null,
    exportType: exportJob?.type ?? null,
    company,
    isGenerating,
    generatePdf,
  };
}

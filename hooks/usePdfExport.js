"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPdfFromElement } from "../utils/pdfExport";

export function usePdfExport() {
  const hostRef = useRef(null);
  const pendingRef = useRef(null);
  const [renderTarget, setRenderTarget] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!renderTarget) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const paper = hostRef.current?.querySelector(".paper");
        const result = await createPdfFromElement(
          paper,
          renderTarget.type,
          renderTarget.estimate.siteName
        );

        if (!cancelled) {
          pendingRef.current?.resolve(result);
        }
      } catch (error) {
        if (!cancelled) {
          pendingRef.current?.reject(error);
        }
      } finally {
        if (!cancelled) {
          pendingRef.current = null;
          setRenderTarget(null);
          setIsGenerating(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [renderTarget]);

  const generatePdf = useCallback(
    (estimate, type) => {
      if (isGenerating) {
        return Promise.reject(new Error("PDF生成中です。"));
      }

      return new Promise((resolve, reject) => {
        pendingRef.current = { resolve, reject };
        setIsGenerating(true);
        setRenderTarget({ estimate, type });
      });
    },
    [isGenerating]
  );

  return {
    hostRef,
    renderEstimate: renderTarget?.estimate ?? null,
    renderType: renderTarget?.type ?? null,
    isGenerating,
    generatePdf,
  };
}

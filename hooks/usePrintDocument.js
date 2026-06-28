"use client";

import { useEffect, useState } from "react";

export function usePrintDocument() {
  const [printDoc, setPrintDoc] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  useEffect(() => {
    const clearPrint = () => {
      setPrintDoc(null);
      setShouldPrint(false);
    };
    window.addEventListener("afterprint", clearPrint);
    return () => window.removeEventListener("afterprint", clearPrint);
  }, []);

  useEffect(() => {
    if (!printDoc || !shouldPrint) return;

    requestAnimationFrame(() => window.print());

    const fallbackTimer = window.setTimeout(() => {
      setPrintDoc(null);
      setShouldPrint(false);
    }, 4000);

    return () => window.clearTimeout(fallbackTimer);
  }, [printDoc, shouldPrint]);

  const requestPrint = (doc) => {
    setPrintDoc(doc);
    setShouldPrint(true);
  };

  return { printDoc, shouldPrint, requestPrint };
}

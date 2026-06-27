"use client";

import { useEffect, useState } from "react";
import { hasPdfFeatures } from "../lib/plan";
import {
  canSharePdfFiles,
  downloadPdfFile,
  sharePdfFile,
} from "../utils/pdfExport";
import { s } from "../lib/styles";

export default function PdfActionButtons({
  plan,
  disabled = false,
  isWorking = false,
  pdfReady,
  onCreateEstimate,
  onCreateInvoice,
  onPdfBlocked,
}) {
  const [canSharePdf, setCanSharePdf] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setCanSharePdf(canSharePdfFiles());
  }, []);

  const pdfDisabled = disabled || isWorking || !hasPdfFeatures(plan);

  const handleCreate = async (type) => {
    if (!hasPdfFeatures(plan)) {
      onPdfBlocked?.();
      return;
    }

    setActionError("");
    try {
      if (type === "invoice") {
        await onCreateInvoice();
      } else {
        await onCreateEstimate();
      }
    } catch (error) {
      setActionError(error?.message || "PDFの作成に失敗しました。");
    }
  };

  const handleShare = async () => {
    if (!pdfReady) return;

    setActionError("");
    try {
      await sharePdfFile(pdfReady.file ?? pdfReady.blob, pdfReady.filename);
    } catch (error) {
      if (error?.name === "AbortError") return;
      setActionError("共有できませんでした。ダウンロードをお試しください。");
    }
  };

  const handleDownload = () => {
    if (!pdfReady) return;

    setActionError("");
    try {
      downloadPdfFile(pdfReady.file ?? pdfReady.blob, pdfReady.filename);
    } catch {
      setActionError("PDFのダウンロードに失敗しました。");
    }
  };

  return (
    <div style={s.pdfActionWrap}>
      <div style={s.pdfActionGrid}>
        <button
          type="button"
          style={{ ...s.pdfEstimateBtn, opacity: pdfDisabled ? 0.5 : 1 }}
          disabled={pdfDisabled}
          onClick={() => handleCreate("estimate")}
        >
          {isWorking ? "PDF作成中…" : "見積PDFを作成"}
        </button>
        <button
          type="button"
          style={{ ...s.pdfInvoiceBtn, opacity: pdfDisabled ? 0.5 : 1 }}
          disabled={pdfDisabled}
          onClick={() => handleCreate("invoice")}
        >
          {isWorking ? "PDF作成中…" : "請求PDFを作成"}
        </button>
      </div>

      {pdfReady && (
        <>
          <div style={s.pdfActionGrid}>
            {canSharePdf && (
              <button type="button" style={s.pdfShareBtn} onClick={handleShare}>
                共有
              </button>
            )}
            <button
              type="button"
              style={{
                ...s.pdfDownloadBtn,
                gridColumn: canSharePdf ? undefined : "1 / -1",
              }}
              onClick={handleDownload}
            >
              ダウンロード
            </button>
          </div>
          <p style={s.pdfStatusText}>PDFを作成しました：{pdfReady.filename}</p>
        </>
      )}

      {actionError && <p style={s.pdfErrorText}>{actionError}</p>}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { hasPdfFeatures } from "../lib/plan";
import {
  canSharePdfFiles,
  downloadPdfFile,
  getAvailableSendMethods,
  sharePdfFile,
} from "../utils/pdfExport";
import { executeSendMethod } from "../utils/sendCenter";
import { s } from "../lib/styles";

export default function PdfActionButtons({
  plan,
  disabled = false,
  isWorking = false,
  pdfReady,
  onCreateEstimate,
  onCreateInvoice,
  onPrintDocument,
  onPdfBlocked,
}) {
  const [canSharePdf, setCanSharePdf] = useState(false);
  const [actionError, setActionError] = useState("");
  const [showSendPanel, setShowSendPanel] = useState(false);
  const [sendMethod, setSendMethod] = useState("line");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setCanSharePdf(canSharePdfFiles());
  }, []);

  useEffect(() => {
    if (!pdfReady) {
      setShowSendPanel(false);
    }
  }, [pdfReady]);

  const sendMethods = getAvailableSendMethods(canSharePdf);
  const pdfDisabled = disabled || isWorking || !hasPdfFeatures(plan);

  const handleCreate = async (type) => {
    if (!hasPdfFeatures(plan)) {
      onPdfBlocked?.();
      return;
    }

    setActionError("");
    setShowSendPanel(false);
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

  const handleSend = async () => {
    if (!pdfReady) return;

    setActionError("");
    setIsSending(true);

    try {
      if (sendMethod === "print") {
        onPrintDocument?.(pdfReady.type === "invoice" ? "invoice" : "estimate");
        setShowSendPanel(false);
        return;
      }

      await executeSendMethod(sendMethod, pdfReady);
      setShowSendPanel(false);
    } catch (error) {
      if (error?.name === "AbortError") return;
      if (sendMethod !== "pdf-save") {
        try {
          downloadPdfFile(pdfReady.file ?? pdfReady.blob, pdfReady.filename);
          setShowSendPanel(false);
          return;
        } catch {
          // fall through
        }
      }
      setActionError(error?.message || "送信に失敗しました。");
    } finally {
      setIsSending(false);
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
          <p style={s.pdfStatusText}>PDFを作成しました：{pdfReady.filename}</p>
          {!showSendPanel ? (
            <button type="button" style={s.sendBtnWide} onClick={() => setShowSendPanel(true)}>
              📤 送る
            </button>
          ) : (
            <div style={s.sendSheetInline}>
              <div style={s.sendSheetDivider} />
              <p style={s.sendSheetTitle}>
                {pdfReady.type === "invoice" ? "請求書を送る" : "見積書を送る"}
              </p>
              <div style={s.sendMethodList}>
                {sendMethods.map((item) => (
                  <label key={item.id} style={s.sendMethodOption}>
                    <input
                      type="radio"
                      name="pdf-send-method"
                      value={item.id}
                      checked={sendMethod === item.id}
                      onChange={() => setSendMethod(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              <div style={s.sendSheetActions}>
                <button
                  type="button"
                  style={s.secondary}
                  onClick={() => setShowSendPanel(false)}
                  disabled={isSending}
                >
                  閉じる
                </button>
                <button
                  type="button"
                  style={s.sendSheetSubmit}
                  onClick={handleSend}
                  disabled={isSending}
                >
                  {isSending ? "送信中…" : "送る"}
                </button>
              </div>
              <div style={s.sendSheetDivider} />
            </div>
          )}
        </>
      )}

      {actionError && <p style={s.pdfErrorText}>{actionError}</p>}
    </div>
  );
}

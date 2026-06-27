"use client";

import { useState } from "react";
import { hasPdfFeatures } from "../lib/plan";
import { SEND_METHODS, executeSendMethod } from "../utils/sendCenter";
import { s } from "../lib/styles";

export default function SendCenterSheet({
  open,
  estimate,
  docType = "estimate",
  onClose,
  onGeneratePdf,
  onPrint,
  onComplete,
  onPdfBlocked,
  plan,
}) {
  const [method, setMethod] = useState("line");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  if (!open || !estimate) return null;

  const title = docType === "invoice" ? "請求書を送る" : "見積書を送る";

  const handleSend = async () => {
    if (!hasPdfFeatures(plan)) {
      onPdfBlocked?.();
      return;
    }

    setError("");
    setIsSending(true);

    try {
      if (method === "print") {
        onPrint?.(estimate, docType);
        onComplete?.({ estimate, docType, method, filename: null });
        onClose?.();
        return;
      }

      const pdfResult = await onGeneratePdf(estimate, docType);
      const action = await executeSendMethod(method, pdfResult);

      if (action === "print") {
        onPrint?.(estimate, docType);
      }

      onComplete?.({
        estimate,
        docType,
        method,
        filename: pdfResult.filename,
      });
      onClose?.();
    } catch (sendError) {
      if (sendError?.name === "AbortError") return;
      setError(sendError?.message || "送信に失敗しました。");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={s.modalOverlay} role="dialog" aria-modal="true">
      <div style={s.sendSheet}>
        <div style={s.sendSheetDivider} />
        <p style={s.sendSheetTitle}>{title}</p>
        <p style={s.sendSheetSite}>{estimate.siteName}</p>

        <div style={s.sendMethodList}>
          {SEND_METHODS.map((item) => (
            <label key={item.id} style={s.sendMethodOption}>
              <input
                type="radio"
                name={`send-method-${estimate.id}-${docType}`}
                value={item.id}
                checked={method === item.id}
                onChange={() => setMethod(item.id)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        {error && <p style={s.pdfErrorText}>{error}</p>}

        <div style={s.sendSheetActions}>
          <button type="button" style={s.secondary} onClick={onClose} disabled={isSending}>
            キャンセル
          </button>
          <button type="button" style={s.sendSheetSubmit} onClick={handleSend} disabled={isSending}>
            {isSending ? "送信中…" : "送る"}
          </button>
        </div>

        <div style={s.sendSheetDivider} />
      </div>
    </div>
  );
}

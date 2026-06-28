"use client";

import { useEffect, useState } from "react";
import { hasPdfFeatures } from "../lib/plan";
import {
  getDocumentDefinition,
  listImplementedDocumentDefinitions,
} from "../lib/documentEngine";
import { canSharePdfFiles, getAvailableSendMethods } from "../utils/pdfExport";
import { executeSendMethod } from "../utils/sendCenter";
import SafeButton from "./SafeButton";
import { s } from "../lib/styles";

export default function DocumentSendButtons({
  plan,
  estimate,
  getEstimate,
  isWorking = false,
  onGeneratePdf,
  onPrintDocument,
  onPdfBlocked,
}) {
  const [canSharePdf, setCanSharePdf] = useState(false);
  const [openDocType, setOpenDocType] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCanSharePdf(canSharePdfFiles());
  }, []);

  const sendMethods = getAvailableSendMethods(canSharePdf);
  const disabled = isWorking || busy || !hasPdfFeatures(plan);

  const resolveEstimate = () => getEstimate?.() ?? estimate;

  const openMenu = (docType) => {
    if (!hasPdfFeatures(plan)) {
      onPdfBlocked?.();
      return;
    }
    setError("");
    setOpenDocType((current) => (current === docType ? null : docType));
  };

  const handleAction = async (method) => {
    if (!openDocType) return;

    const currentEstimate = resolveEstimate();
    if (!currentEstimate) return;

    setError("");
    setBusy(true);

    try {
      if (method === "print") {
        onPrintDocument?.(currentEstimate, openDocType);
        setOpenDocType(null);
        return;
      }

      const pdfResult = await onGeneratePdf(currentEstimate, openDocType);
      await executeSendMethod(method, pdfResult);
      setOpenDocType(null);
    } catch (actionError) {
      if (actionError?.name === "AbortError") return;
      setError(actionError?.message || "送信に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const sendDocuments = listImplementedDocumentDefinitions();
  const menuTitle = openDocType ? getDocumentDefinition(openDocType).menuTitle : "";

  return (
    <div style={s.pdfActionWrap}>
      <div style={s.pdfActionGrid}>
        {sendDocuments.map((definition) => {
          const docType = definition.id;
          const buttonStyle = docType === "invoice" ? s.pdfInvoiceBtn : s.pdfEstimateBtn;

          return (
            <SafeButton
              key={docType}
              type="button"
              style={{ ...buttonStyle, opacity: disabled ? 0.5 : 1 }}
              disabled={disabled}
              tapLabel="送る"
              onPress={() => openMenu(docType)}
            >
              {busy && openDocType === docType ? "処理中…" : `📤 ${definition.sendLabel}`}
            </SafeButton>
          );
        })}
      </div>

      {openDocType && (
        <div style={s.sendSheetInline}>
          <div style={s.sendSheetDivider} />
          <p style={s.sendSheetTitle}>{menuTitle}</p>
          <div style={s.sendMethodActions}>
            {sendMethods.map((item) => (
              <SafeButton
                key={item.id}
                type="button"
                style={item.id === "share" ? s.pdfShareBtn : s.sendMethodActionBtn}
                disabled={busy}
                onPress={() => handleAction(item.id)}
              >
                {item.label}
              </SafeButton>
            ))}
          </div>
          <SafeButton
            type="button"
            style={s.secondary}
            disabled={busy}
            onPress={() => setOpenDocType(null)}
          >
            閉じる
          </SafeButton>
          <div style={s.sendSheetDivider} />
        </div>
      )}

      {error && <p style={s.pdfErrorText}>{error}</p>}
    </div>
  );
}

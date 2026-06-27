"use client";

import { useState } from "react";
import {
  getEstimateDisplayTotals,
  getProfitRateColorBand,
  yen,
} from "../utils/calcProfit";
import PaymentControls from "./PaymentControls";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PdfActionButtons from "./PdfActionButtons";
import SendCenterSheet from "./SendCenterSheet";
import { s } from "../lib/styles";
import UsageCard from "./UsageCard";

export default function EstimateList({
  estimates,
  plan,
  clientCount,
  onBack,
  onEdit,
  onCopy,
  onGeneratePdf,
  isPdfGenerating,
  onPdfBlocked,
  onPrintDocument,
  onSendComplete,
  onAdvancePayment,
  onMarkPaid,
}) {
  const [pdfReadyMap, setPdfReadyMap] = useState({});
  const [workingEstimateId, setWorkingEstimateId] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [sendSheet, setSendSheet] = useState(null);

  const createPdf = async (estimate, type) => {
    setPdfError("");
    setWorkingEstimateId(estimate.id);

    try {
      const result = await onGeneratePdf(estimate, type);
      setPdfReadyMap((prev) => ({
        ...prev,
        [estimate.id]: result,
      }));
      return result;
    } catch (error) {
      setPdfError(error?.message || "PDFの作成に失敗しました。");
      throw error;
    } finally {
      setWorkingEstimateId(null);
    }
  };

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>保存済み見積</h1>
      <p style={s.sub}>見積中 → 送付済 → 請求済 → 入金待ち → 入金済</p>

      <UsageCard plan={plan} clientCount={clientCount} estimateCount={estimates.length} compact />

      {pdfError && <p style={s.pdfErrorText}>{pdfError}</p>}

      {estimates.length === 0 ? (
        <p style={s.muted}>保存済みの見積はありません。</p>
      ) : (
        estimates.map((e) => {
          const display = getEstimateDisplayTotals(e);
          const band = getProfitRateColorBand(display.rate);
          const pdfReady = pdfReadyMap[e.id];
          const isWorking = workingEstimateId === e.id || isPdfGenerating;

          return (
            <section key={e.id} style={s.listCard}>
              <div style={s.listCardHeader}>
                <div style={s.listCardTitleBlock}>
                  <PaymentStatusBadge status={e.paymentStatus} />
                  <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>{e.siteName}</h2>
                </div>
                <button
                  type="button"
                  style={s.sendBtn}
                  onClick={() => setSendSheet({ estimate: e, docType: "estimate" })}
                >
                  📤 送る
                </button>
              </div>

              <p style={s.listMeta}>{e.client}</p>

              <div style={s.listStats}>
                <div style={s.listStat}>
                  <p style={s.listStatLabel}>売上</p>
                  <p style={s.listStatValue}>{yen(display.sales)}</p>
                </div>
                <div style={s.listStat}>
                  <p style={s.listStatLabel}>利益</p>
                  <p style={s.listStatValue}>{yen(display.profit)}</p>
                </div>
                <div style={s.listStat}>
                  <p style={s.listStatLabel}>利益率</p>
                  <p style={{ ...s.listStatValue, color: band.color }}>
                    {display.sales > 0 ? `${Number(display.rate || 0).toFixed(1)}%` : "—"}
                  </p>
                </div>
              </div>

              <PaymentControls
                paymentStatus={e.paymentStatus}
                onAdvance={() => onAdvancePayment(e.id)}
                onMarkPaid={() => onMarkPaid(e.id)}
              />

              <button
                type="button"
                style={s.invoiceSendBtn}
                onClick={() => setSendSheet({ estimate: e, docType: "invoice" })}
              >
                請求書を送る
              </button>

              <PdfActionButtons
                plan={plan}
                isWorking={isWorking}
                pdfReady={pdfReady}
                onCreateEstimate={() => createPdf(e, "estimate")}
                onCreateInvoice={() => createPdf(e, "invoice")}
                onPrintDocument={(_, docType) => onPrintDocument(e, docType)}
                onPdfBlocked={onPdfBlocked}
              />

              <div style={s.rowActions}>
                <button style={s.copyBtn} onClick={() => onCopy(e.id)}>
                  📋 コピー
                </button>
                <button style={s.editBtn} onClick={() => onEdit(e.id)}>
                  編集
                </button>
              </div>
            </section>
          );
        })
      )}

      <SendCenterSheet
        open={!!sendSheet}
        estimate={sendSheet?.estimate}
        docType={sendSheet?.docType}
        plan={plan}
        onClose={() => setSendSheet(null)}
        onGeneratePdf={onGeneratePdf}
        onPrint={onPrintDocument}
        onPdfBlocked={onPdfBlocked}
        onComplete={(payload) => {
          onSendComplete?.(payload);
          setSendSheet(null);
        }}
      />
    </main>
  );
}

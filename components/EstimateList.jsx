"use client";

import { useEffect, useState } from "react";
import {
  getEstimateDisplayTotals,
  getProfitRateColorBand,
  yen,
} from "../utils/calcProfit";
import { hasPdfFeatures } from "../lib/plan";
import {
  canSharePdfFiles,
  downloadPdfFile,
  sharePdfFile,
} from "../utils/pdfExport";
import PaymentControls from "./PaymentControls";
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
  onAdvancePayment,
  onMarkPaid,
}) {
  const [pdfReadyMap, setPdfReadyMap] = useState({});
  const [workingEstimateId, setWorkingEstimateId] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [canSharePdf, setCanSharePdf] = useState(false);

  useEffect(() => {
    setCanSharePdf(canSharePdfFiles());
  }, []);

  const handleCreatePdf = async (estimate, type) => {
    if (!hasPdfFeatures(plan)) {
      onPdfBlocked?.();
      return;
    }

    setPdfError("");
    setWorkingEstimateId(estimate.id);

    try {
      const result = await onGeneratePdf(estimate, type);
      setPdfReadyMap((prev) => ({
        ...prev,
        [estimate.id]: result,
      }));
    } catch (error) {
      setPdfError(error?.message || "PDFの作成に失敗しました。");
    } finally {
      setWorkingEstimateId(null);
    }
  };

  const handleShareOrDownload = async (estimateId) => {
    const pdf = pdfReadyMap[estimateId];
    if (!pdf) return;

    setPdfError("");

    try {
      if (canSharePdf) {
        await sharePdfFile(pdf.blob, pdf.filename);
        return;
      }
      downloadPdfFile(pdf.blob, pdf.filename);
    } catch (error) {
      if (error?.name === "AbortError") return;
      try {
        downloadPdfFile(pdf.blob, pdf.filename);
      } catch {
        setPdfError("PDFの共有に失敗しました。");
      }
    }
  };

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>保存済み見積</h1>
      <p style={s.sub}>見積 → 受注 → 請求 → 入金待ち → 入金済</p>

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
          const pdfDisabled = isWorking || !hasPdfFeatures(plan);

          return (
            <section key={e.id} style={s.listCard}>
              <h2 style={{ ...s.sectionTitle, marginBottom: 8 }}>{e.siteName}</h2>
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

              <div style={pdfReady ? s.pdfActionGridWithShare : s.pdfActionGrid}>
                <button
                  type="button"
                  style={{
                    ...s.pdfEstimateBtn,
                    opacity: pdfDisabled ? 0.5 : 1,
                  }}
                  disabled={pdfDisabled}
                  onClick={() => handleCreatePdf(e, "estimate")}
                >
                  {isWorking ? "PDF作成中…" : "見積PDF"}
                </button>
                <button
                  type="button"
                  style={{
                    ...s.pdfInvoiceBtn,
                    opacity: pdfDisabled ? 0.5 : 1,
                  }}
                  disabled={pdfDisabled}
                  onClick={() => handleCreatePdf(e, "invoice")}
                >
                  {isWorking ? "PDF作成中…" : "請求PDF"}
                </button>
                {pdfReady && (
                  <button
                    type="button"
                    style={canSharePdf ? s.pdfShareBtn : s.pdfDownloadBtn}
                    onClick={() => handleShareOrDownload(e.id)}
                  >
                    {canSharePdf ? "共有" : "PDFをダウンロード"}
                  </button>
                )}
              </div>

              {pdfReady && (
                <p style={s.pdfStatusText}>
                  PDFを作成しました：{pdfReady.filename}
                </p>
              )}

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
    </main>
  );
}

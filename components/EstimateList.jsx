"use client";

import {
  getEstimateDisplayTotals,
  getProfitRateColorBand,
  yen,
} from "../utils/calcProfit";
import PaymentControls from "./PaymentControls";
import PaymentStatusBadge from "./PaymentStatusBadge";
import DocumentSendButtons from "./DocumentSendButtons";
import SafeButton from "./SafeButton";
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
  onAdvancePayment,
  onMarkPaid,
}) {
  return (
    <main style={s.page}>
      <SafeButton style={s.back} type="button" tapLabel="戻る" onPress={onBack}>← 戻る</SafeButton>
      <h1 style={s.title}>保存済み見積</h1>
      <p style={s.sub}>見積中 → 送付済 → 請求済 → 入金待ち → 入金済</p>

      <UsageCard plan={plan} clientCount={clientCount} estimateCount={estimates.length} compact />

      {estimates.length === 0 ? (
        <p style={s.muted}>保存済みの見積はありません。</p>
      ) : (
        estimates.map((e) => {
          const display = getEstimateDisplayTotals(e);
          const band = getProfitRateColorBand(display.rate);

          return (
            <section key={e.id} style={s.listCard}>
              <div style={s.listCardHeader}>
                <div style={s.listCardTitleBlock}>
                  <PaymentStatusBadge status={e.paymentStatus} />
                  <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>{e.siteName}</h2>
                </div>
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

              <DocumentSendButtons
                plan={plan}
                estimate={e}
                isWorking={isPdfGenerating}
                onGeneratePdf={onGeneratePdf}
                onPrintDocument={onPrintDocument}
                onPdfBlocked={onPdfBlocked}
              />

              <div style={s.rowActions}>
                <SafeButton style={s.copyBtn} onPress={() => onCopy(e.id)}>
                  📋 コピー
                </SafeButton>
                <SafeButton style={s.editBtn} type="button" tapLabel="編集" onPress={() => onEdit(e.id)}>
                  編集
                </SafeButton>
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}

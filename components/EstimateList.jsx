import {
  getEstimateDisplayTotals,
  getProfitRateColorBand,
  yen,
} from "../utils/calcProfit";
import PaymentControls from "./PaymentControls";
import { s } from "../lib/styles";
import UsageCard from "./UsageCard";

export default function EstimateList({
  estimates,
  plan,
  clientCount,
  onBack,
  onEdit,
  onPdf,
  onAdvancePayment,
  onMarkPaid,
}) {
  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>保存済み見積</h1>
      <p style={s.sub}>見積 → 受注 → 請求 → 入金待ち → 入金済</p>

      <UsageCard plan={plan} clientCount={clientCount} estimateCount={estimates.length} compact />

      {estimates.length === 0 ? (
        <p style={s.muted}>保存済みの見積はありません。</p>
      ) : (
        estimates.map((e) => {
          const display = getEstimateDisplayTotals(e);
          const band = getProfitRateColorBand(display.rate);

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

              <div style={s.rowActions}>
                <button style={s.editBtn} onClick={() => onEdit(e.id)}>
                  編集
                </button>
                <button style={s.pdf} onClick={() => onPdf(e)}>
                  印刷
                </button>
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}

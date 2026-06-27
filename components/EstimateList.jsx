import {
  getEstimateDisplayTotals,
  getProfitRateColorBand,
  yen,
} from "../utils/calcProfit";
import {
  FREE_ESTIMATE_LIMIT,
  isPaidEstimate,
} from "../lib/billing";
import BillingBadge from "./BillingBadge";
import UsageCard from "./UsageCard";
import { s } from "../lib/styles";

export default function EstimateList({ estimates, clientCount, onBack, onEdit, onPdf }) {
  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>見積一覧</h1>

      <UsageCard clientCount={clientCount} estimateCount={estimates.length} compact />

      {estimates.length === 0 ? (
        <p style={s.muted}>保存済みの見積はありません。</p>
      ) : (
        estimates.map((e) => {
          const display = getEstimateDisplayTotals(e);
          const band = getProfitRateColorBand(display.rate);
          const paid = isPaidEstimate(estimates, e.id);

          return (
            <section key={e.id} style={s.listCard}>
              <div style={s.cardHeaderRow}>
                <h2 style={{ ...s.sectionTitle, margin: 0 }}>{e.siteName}</h2>
                {paid && <BillingBadge />}
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

      {estimates.length > FREE_ESTIMATE_LIMIT && (
        <p style={{ ...s.usageNote, marginTop: 16, color: "#ff8a00" }}>
          {FREE_ESTIMATE_LIMIT + 1}件目以降は課金対象です
        </p>
      )}
    </main>
  );
}

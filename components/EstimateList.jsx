import {
  formatCostDisplay,
  formatCostExtrasDisplay,
  formatOutsourcingDisplay,
  formatProfitRateJudgment,
  formatSalesDisplay,
  getEstimateDisplayTotals,
  getOutsourcingModeLabel,
  getTargetProfitRate,
  yen,
} from "../utils/calcProfit";
import { getTransportDetailLabel, getTransportModeLabel } from "../utils/calcTransport";
import { s } from "../lib/styles";

function CostExtrasSummary({ estimate }) {
  const display = getEstimateDisplayTotals(estimate);

  return (
    <>
      <p style={s.muted}>
        外注費方式 {getOutsourcingModeLabel(display.outsourcingMode)} ·{" "}
        {formatOutsourcingDisplay(display)}
      </p>
      <p style={s.muted}>現場原価 {formatCostExtrasDisplay(display)}</p>
      <p style={s.muted}>
        交通費方式 {getTransportModeLabel(estimate)} · {getTransportDetailLabel(estimate)}
      </p>
    </>
  );
}

function EstimateSummary({ estimate }) {
  const display = getEstimateDisplayTotals(estimate);

  return (
    <>
      <p style={{ ...s.muted, margin: "8px 0 0", whiteSpace: "pre-line", lineHeight: 1.6 }}>
        売上{"\n"}
        {formatSalesDisplay(display)}
      </p>
      <p style={{ ...s.muted, margin: "8px 0 0", whiteSpace: "pre-line", lineHeight: 1.6 }}>
        原価{"\n"}
        {formatCostDisplay(display)}
      </p>
      <p style={{ margin: "8px 0 0" }}>
        利益 {yen(display.profit)} / {formatProfitRateJudgment(display.rate)} / 目標 {getTargetProfitRate(estimate)}%
      </p>
    </>
  );
}

export default function EstimateList({ estimates, onBack, onDelete, onEdit, onPdf }) {
  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>見積一覧</h1>

      {estimates.length === 0 ? (
        <p>まだ保存はありません。</p>
      ) : (
        estimates.map((e) => (
          <section key={e.id} style={s.listCard}>
            <h2 style={s.sectionTitle}>{e.siteName}</h2>
            <p style={s.muted}>{e.client} · {e.workType}</p>
            {e.siteAddress && <p style={s.muted}>住所 {e.siteAddress}</p>}
            <CostExtrasSummary estimate={e} />
            <EstimateSummary estimate={e} />
            <small style={s.muted}>{e.createdAt}</small>
            <div style={s.rowActions}>
              <button style={s.secondary} onClick={() => onEdit(e.id)}>
                編集
              </button>
              <button style={s.pdf} onClick={() => onPdf(e)}>
                印刷
              </button>
              <button style={s.delete} onClick={() => onDelete(e.id)}>
                削除
              </button>
            </div>
          </section>
        ))
      )}
    </main>
  );
}

import {
  formatCostDisplay,
  formatCostExtrasDisplay,
  formatProfitRateJudgment,
  formatSalesDisplay,
  getEstimateDisplayTotals,
  getProfitRateJudgment,
  getTargetProfitRate,
  yen,
} from "../utils/calcProfit";
import { getTransportDetailLabel, getTransportModeLabel } from "../utils/calcTransport";
import SafeButton from "./SafeButton";
import { s } from "../lib/styles";

export default function PdfEstimate({ estimates, onBack, onPdf }) {
  return (
    <main style={s.page}>
      <SafeButton style={s.back} onPress={onBack}>← 戻る</SafeButton>
      <h1 style={s.title}>見積書の印刷</h1>
      <p style={s.sub}>保存済み見積から A4 見積書を印刷</p>

      {estimates.length === 0 ? (
        <p style={s.muted}>保存済みの見積がありません。先に見積を作成・保存してください。</p>
      ) : (
        estimates.map((e) => {
          const display = getEstimateDisplayTotals(e);
          const judgment = getProfitRateJudgment(display.rate);

          return (
            <section key={e.id} style={s.listCard}>
              <h2 style={s.sectionTitle}>{e.siteName}</h2>
              <p style={s.muted}>{e.client} · {e.workType}</p>
              <p style={s.muted}>原価内訳 {formatCostExtrasDisplay(display)}</p>
              <p style={s.muted}>
                交通費方式 {getTransportModeLabel(e)} · {getTransportDetailLabel(e)}
              </p>
              <p style={{ ...s.muted, margin: "8px 0 0", whiteSpace: "pre-line", lineHeight: 1.6 }}>
                売上{"\n"}
                {formatSalesDisplay(display)}
              </p>
              <p style={{ ...s.muted, margin: "8px 0 0", whiteSpace: "pre-line", lineHeight: 1.6 }}>
                原価{"\n"}
                {formatCostDisplay(display)}
              </p>
              <p style={{ margin: "8px 0 0" }}>
                利益 {yen(display.profit)} / {formatProfitRateJudgment(display.rate)} / 目標 {getTargetProfitRate(e)}%
              </p>
              <p style={s.muted}>判定 {judgment.icon} {judgment.label}</p>
              <small style={s.muted}>{e.createdAt}</small>
              <SafeButton
                style={{ ...s.pdf, width: "100%", marginTop: 12 }}
                onPress={() => onPdf(e)}
              >
                印刷する
              </SafeButton>
            </section>
          );
        })
      )}
    </main>
  );
}

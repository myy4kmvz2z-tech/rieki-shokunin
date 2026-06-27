import { getAiProfitDiagnosis } from "../utils/aiProfitDiagnosis";
import { yen } from "../utils/calcProfit";
import { s } from "../lib/styles";

function AdviceRow({ label, value }) {
  return (
    <div style={s.planRow}>
      <span style={s.planLabel}>{label}</span>
      <span style={s.planValue}>{value}</span>
    </div>
  );
}

export default function AiProfitDiagnosis({ totals, targetProfitRate }) {
  const diagnosis = getAiProfitDiagnosis({
    rate: totals.rate,
    totalCost: totals.cost,
    area: totals.area ?? undefined,
    effectiveSellingUnitPrice: totals.effectiveSellingUnitPrice,
    discount: totals.discount,
    profit: totals.profit,
    targetProfitRate,
  });

  if (!diagnosis.canDiagnose && totals.sales <= 0) {
    return <p style={s.muted}>売上を入力するとAI利益診断が表示されます。</p>;
  }

  const { status, orderJudgment } = diagnosis;

  return (
    <>
      <div style={{ ...s.result, marginTop: 4 }}>
        <p style={{ ...s.resultLabel, color: status.color }}>
          {status.icon} {status.level}
        </p>
        <p style={{ ...s.resultDetail, color: status.color, fontWeight: 900, fontSize: 16 }}>
          {status.message || "—"}
        </p>
      </div>

      <div style={{ ...s.listCard, marginTop: 0, padding: "18px 16px" }}>
        <p style={s.planSectionTitle}>■ AIアドバイス</p>
        <AdviceRow
          label="推奨販売単価"
          value={
            diagnosis.recommendedUnitPrice > 0
              ? `${yen(diagnosis.recommendedUnitPrice)}/㎡`
              : "—"
          }
        />
        <AdviceRow
          label="目標までの単価"
          value={
            diagnosis.unitPriceIncrease > 0
              ? `あと${diagnosis.unitPriceIncrease.toLocaleString()}円/㎡`
              : "達成済み"
          }
        />
        <AdviceRow
          label="利益増加見込"
          value={
            diagnosis.profitIncrease > 0 ? `${yen(diagnosis.profitIncrease)}` : "—"
          }
        />
        <AdviceRow label="値引きの影響" value={diagnosis.discountImpactText} />
        <div style={{ ...s.planRow, borderBottom: "none", paddingTop: 14 }}>
          <span style={s.planLabel}>受注判定</span>
          <span style={{ ...s.planValue, color: orderJudgment.color }}>
            {orderJudgment.icon} {orderJudgment.label}
          </span>
        </div>
      </div>
    </>
  );
}

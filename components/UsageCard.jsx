import { getUsageSummary } from "../lib/plan";
import { s } from "../lib/styles";

export default function UsageCard({ plan, clientCount, estimateCount, compact = false }) {
  const usage = getUsageSummary(plan, clientCount, estimateCount);

  return (
    <section style={compact ? s.usageCardCompact : s.usageCard}>
      <p style={s.usageTitle}>利用状況</p>
      <p style={s.usageRow}>プラン：{usage.planLabel}</p>
      <p style={s.usageRow}>
        元請：{usage.clientCount}件 / {usage.clientLimitLabel}
      </p>
      <p style={s.usageRow}>
        見積：{usage.estimateCount}件 / {usage.estimateLimitLabel}
      </p>
      {usage.clientRemaining !== null && (
        <p style={s.usageNote}>元請 残り{usage.clientRemaining}件</p>
      )}
      {usage.estimateRemaining !== null && (
        <p style={s.usageNote}>見積 残り{usage.estimateRemaining}件</p>
      )}
      {(usage.isClientLimitReached || usage.isEstimateLimitReached) && (
        <p style={{ ...s.usageNote, color: "#ff8a00", marginTop: compact ? 4 : 8 }}>
          上限に達しています。料金プランからアップグレードしてください。
        </p>
      )}
    </section>
  );
}

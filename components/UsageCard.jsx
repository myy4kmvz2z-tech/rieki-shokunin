import {
  FREE_CLIENT_LIMIT,
  FREE_ESTIMATE_LIMIT,
  formatBillingYen,
  getUsageSummary,
} from "../lib/billing";
import { s } from "../lib/styles";

export default function UsageCard({ clientCount, estimateCount, compact = false }) {
  const usage = getUsageSummary(clientCount, estimateCount);

  return (
    <section style={compact ? s.usageCardCompact : s.usageCard}>
      <p style={s.usageTitle}>利用状況</p>
      <p style={s.usageRow}>
        元請：{usage.clientCount}件 / 無料{FREE_CLIENT_LIMIT}件
      </p>
      <p style={s.usageRow}>
        見積：{usage.estimateCount}件 / 無料{FREE_ESTIMATE_LIMIT}件
      </p>
      {!compact && (
        <>
          <p style={s.usageNote}>4件目以降は5件ごとに500円</p>
          <p style={s.usageNote}>11件目以降は10件ごとに500円</p>
        </>
      )}
      <p style={s.usageBilling}>
        追加課金目安 {formatBillingYen(usage.totalBilling)}
      </p>
      {usage.totalBilling > 0 && (
        <p style={{ ...s.usageNote, color: "#ff8a00", marginTop: 8 }}>※ 課金対象あり（決済未連携）</p>
      )}
    </section>
  );
}

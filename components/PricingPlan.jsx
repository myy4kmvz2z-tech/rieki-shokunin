import {
  FREE_CLIENT_LIMIT,
  FREE_ESTIMATE_LIMIT,
  formatBillingYen,
  getUsageSummary,
} from "../lib/billing";
import { getPlanLabel, isProPlan, PLAN_FREE, PLAN_PRO } from "../lib/plan";
import { s } from "../lib/styles";

function PlanRow({ label, value, highlight }) {
  return (
    <div style={s.planRow}>
      <span style={s.planLabel}>{label}</span>
      <span style={{ ...s.planValue, color: highlight ? "#ff8a00" : "#fff" }}>{value}</span>
    </div>
  );
}

function PlanSection({ title, children }) {
  return (
    <section style={s.listCard}>
      <h2 style={s.planSectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

export default function PricingPlan({ clients, estimates, plan, onSetPlan, onBack }) {
  const usage = getUsageSummary(clients.length, estimates.length);
  const pro = isProPlan(plan);

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>料金プラン</h1>

      <PlanSection title="ご利用プラン">
        <PlanRow label="現在のプラン" value={getPlanLabel(plan)} highlight={pro} />
        <PlanRow
          label="AI利益診断"
          value={pro ? "利用可" : "プロプラン限定"}
        />
        <PlanRow
          label="AI社長コメント"
          value={pro ? "利用可" : "プロプラン限定"}
        />
        <button
          type="button"
          style={{ ...s.secondary, width: "100%", marginTop: 8 }}
          onClick={() => onSetPlan(pro ? PLAN_FREE : PLAN_PRO)}
        >
          {pro ? "無料プランに切替（デモ）" : "プロプランに切替（デモ）"}
        </button>
        <p style={s.planNote}>※ 決済連携前のデモ切替です</p>
      </PlanSection>

      <PlanSection title="無料枠">
        <PlanRow label="元請管理" value={`${FREE_CLIENT_LIMIT}件まで無料`} />
        <PlanRow label="見積保存" value={`${FREE_ESTIMATE_LIMIT}件まで無料`} />
      </PlanSection>

      <PlanSection title="追加課金">
        <PlanRow label="元請" value="4件目以降、5件ごとに500円" />
        <p style={s.planExample}>例）4〜8件：500円 / 9〜13件：1,000円</p>
        <PlanRow label="見積" value="11件目以降、10件ごとに500円" />
        <p style={s.planExample}>例）11〜20件：500円 / 21〜30件：1,000円</p>
      </PlanSection>

      <PlanSection title="現在の利用状況">
        <PlanRow label="元請" value={`${usage.clientCount}件`} />
        <PlanRow label="見積" value={`${usage.estimateCount}件`} />
        <PlanRow
          label="元請 無料枠残り"
          value={`${usage.clientFreeRemaining}件`}
          highlight={usage.clientFreeRemaining === 0}
        />
        <PlanRow
          label="見積 無料枠残り"
          value={`${usage.estimateFreeRemaining}件`}
          highlight={usage.estimateFreeRemaining === 0}
        />
      </PlanSection>

      <section style={{ ...s.listCard, borderColor: "#ff6a00" }}>
        <h2 style={s.planSectionTitle}>追加課金目安</h2>
        <PlanRow label="元請" value={formatBillingYen(usage.clientBilling)} />
        <PlanRow label="見積" value={formatBillingYen(usage.estimateBilling)} />
        <div style={s.planTotal}>
          <span style={s.planLabel}>合計</span>
          <span style={s.planTotalValue}>{formatBillingYen(usage.totalBilling)}</span>
        </div>
        <p style={s.planNote}>※ 表示のみ（決済・Stripe連携は後日対応）</p>
      </section>
    </main>
  );
}

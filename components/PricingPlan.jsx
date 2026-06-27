import {
  getPlanDefinition,
  getPlanLabel,
  getUsageSummary,
  normalizePlan,
  PLAN_CATALOG,
  PLAN_IDS,
} from "../lib/plan";
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

function PlanCard({ item, current, onSelect }) {
  const active = item.id === current;
  return (
    <section
      style={{
        ...s.listCard,
        marginTop: 12,
        borderColor: active ? "#ff6a00" : "#2a2a2a",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <h2 style={{ ...s.sectionTitle, margin: 0, fontSize: 20 }}>{item.label}</h2>
        <span style={{ color: "#ff8a00", fontWeight: 900, fontSize: 16 }}>{item.priceLabel}</span>
      </div>
      {active && <p style={{ ...s.proBadge, marginTop: 12 }}>現在のプラン</p>}
      <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "#ccc", lineHeight: 1.8 }}>
        {item.highlights.map((line) => (
          <li key={line} style={{ fontWeight: 700, fontSize: 14 }}>
            {line}
          </li>
        ))}
      </ul>
      {!active && (
        <button
          type="button"
          style={{ ...s.secondary, width: "100%", marginTop: 14 }}
          onClick={() => onSelect(item.id)}
        >
          このプランに切替（デモ）
        </button>
      )}
    </section>
  );
}

export default function PricingPlan({ clients, estimates, plan, onSetPlan, onBack }) {
  const current = normalizePlan(plan);
  const usage = getUsageSummary(plan, clients.length, estimates.length);
  const def = getPlanDefinition(plan);

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>料金プラン</h1>

      <PlanSection title="現在のプラン">
        <PlanRow label="プラン" value={getPlanLabel(plan)} highlight />
        <PlanRow label="月額" value={def.priceLabel} />
        <PlanRow label="元請" value={usage.clientLimitLabel} />
        <PlanRow label="見積保存" value={usage.estimateLimitLabel} />
      </PlanSection>

      <PlanSection title="現在の利用状況">
        <PlanRow label="元請" value={`${usage.clientCount}件`} />
        <PlanRow label="見積" value={`${usage.estimateCount}件`} />
        {usage.clientRemaining !== null && (
          <PlanRow
            label="元請 残り"
            value={`${usage.clientRemaining}件`}
            highlight={usage.clientRemaining === 0}
          />
        )}
        {usage.estimateRemaining !== null && (
          <PlanRow
            label="見積 残り"
            value={`${usage.estimateRemaining}件`}
            highlight={usage.estimateRemaining === 0}
          />
        )}
      </PlanSection>

      <p style={{ ...s.usageTitle, marginTop: 8 }}>プラン一覧</p>
      {PLAN_CATALOG.map((item) => (
        <PlanCard key={item.id} item={item} current={current} onSelect={onSetPlan} />
      ))}

      <p style={{ ...s.planNote, marginTop: 16 }}>
        ※ 決済・Stripe連携は後日対応。切替はデモ用です。
      </p>
    </main>
  );
}

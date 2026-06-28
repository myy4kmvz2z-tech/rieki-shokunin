"use client";

import {
  getPlanLabel,
  getUsageSummary,
  normalizePlan,
  PLAN_CATALOG,
} from "../lib/plan";
import SafeButton from "./SafeButton";
import { s } from "../lib/styles";

function PricingCard({ item, isCurrent, onSelect, onContact }) {
  const isPro = item.popular;
  const isCorporate = item.ctaKind === "contact";

  const handleClick = () => {
    if (isCorporate) {
      onContact?.();
      return;
    }
    if (!isCurrent) onSelect(item.id);
  };

  return (
    <article
      style={{
        ...s.pricingCard,
        ...(isPro ? s.pricingCardFeatured : null),
        ...(isCurrent ? s.pricingCardCurrent : null),
      }}
    >
      {isPro && item.popularLabel && (
        <p style={s.pricingPopular}>{item.popularLabel}</p>
      )}
      {isCurrent && <p style={s.pricingCurrentBadge}>現在のプラン</p>}

      <h2 style={s.pricingName}>{item.label}</h2>
      <div style={s.pricingPriceRow}>
        <span style={s.pricingPrice}>{item.priceDisplay}</span>
        {item.priceSub && <span style={s.pricingPriceSub}>{item.priceSub}</span>}
      </div>

      <ul style={s.pricingFeatures}>
        {item.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <SafeButton
        type="button"
        style={
          isCurrent
            ? s.pricingBtnCurrent
            : isPro
              ? s.pricingBtnPrimary
              : isCorporate
                ? s.pricingBtnOutline
                : s.pricingBtnSecondary
        }
        onPress={handleClick}
        disabled={isCurrent && !isCorporate}
      >
        {isCurrent && !isCorporate ? "利用中" : item.cta}
      </SafeButton>
    </article>
  );
}

export default function PricingPlan({ partners, estimates, plan, onSetPlan, onBack }) {
  const current = normalizePlan(plan);
  const usage = getUsageSummary(plan, partners.length, estimates.length);

  const handleContact = () => {
    alert("法人プランのお問い合わせは準備中です。\n後日ご連絡いたします。");
  };

  return (
    <main style={s.page}>
      <SafeButton style={s.back} onPress={onBack}>← 戻る</SafeButton>
      <p style={s.pricingKicker}>料金プラン</p>
      <h1 style={{ ...s.title, marginBottom: 8 }}>{getPlanLabel(plan)}</h1>
      <p style={{ ...s.muted, marginBottom: 24, fontSize: 15 }}>
        取引先 {usage.clientCount}/{usage.clientLimitLabel} · 見積 {usage.estimateCount}/
        {usage.estimateLimitLabel}
      </p>

      <div style={s.pricingStack}>
        {PLAN_CATALOG.map((item) => (
          <PricingCard
            key={item.id}
            item={item}
            isCurrent={item.id === current}
            onSelect={onSetPlan}
            onContact={handleContact}
          />
        ))}
      </div>

      <p style={{ ...s.planNote, marginTop: 20, textAlign: "center" }}>
        決済連携は準備中です。ボタンはデモ用のプラン切替です。
      </p>
    </main>
  );
}

export const PLAN_FREE = "free";
export const PLAN_LIGHT = "light";
export const PLAN_PRO = "pro";
export const PLAN_CORPORATE = "corporate";

export const DEFAULT_PLAN = PLAN_FREE;

export const PLAN_IDS = [PLAN_FREE, PLAN_LIGHT, PLAN_PRO, PLAN_CORPORATE];

export const PLAN_CATALOG = [
  {
    id: PLAN_FREE,
    label: "無料",
    priceLabel: "0円",
    clientLimit: 3,
    estimateLimit: 10,
    highlights: ["元請 3件まで", "見積保存 10件まで"],
  },
  {
    id: PLAN_LIGHT,
    label: "ライト",
    priceLabel: "月額500円",
    clientLimit: 10,
    estimateLimit: 50,
    highlights: ["元請 10件まで", "見積保存 50件まで"],
  },
  {
    id: PLAN_PRO,
    label: "プロ",
    priceLabel: "月額1,500円",
    clientLimit: null,
    estimateLimit: null,
    highlights: [
      "元請 無制限",
      "見積保存 無制限",
      "PDF見積書",
      "PDF請求書",
      "利益ダッシュボード",
      "AI利益診断",
    ],
  },
  {
    id: PLAN_CORPORATE,
    label: "法人",
    priceLabel: "月額3,000円〜",
    clientLimit: null,
    estimateLimit: null,
    highlights: ["社員共有", "クラウド保存", "複数端末対応", "プロ機能すべて"],
  },
];

export function normalizePlan(plan) {
  return PLAN_IDS.includes(plan) ? plan : PLAN_FREE;
}

export function getPlanDefinition(plan) {
  return PLAN_CATALOG.find((item) => item.id === normalizePlan(plan)) ?? PLAN_CATALOG[0];
}

export function getPlanLabel(plan) {
  return `${getPlanDefinition(plan).label}プラン`;
}

export function formatPlanLimit(limit) {
  return limit === null ? "無制限" : `${limit}件`;
}

export function hasProFeatures(plan) {
  const id = normalizePlan(plan);
  return id === PLAN_PRO || id === PLAN_CORPORATE;
}

/** @deprecated use hasProFeatures */
export function isProPlan(plan) {
  return hasProFeatures(plan);
}

export function hasPdfFeatures(plan) {
  return hasProFeatures(plan);
}

export function canAddClient(plan, currentCount) {
  const { clientLimit } = getPlanDefinition(plan);
  if (clientLimit === null) return true;
  return Number(currentCount || 0) < clientLimit;
}

export function canSaveEstimate(plan, currentCount) {
  const { estimateLimit } = getPlanDefinition(plan);
  if (estimateLimit === null) return true;
  return Number(currentCount || 0) < estimateLimit;
}

export function getUsageSummary(plan, clientCount, estimateCount) {
  const def = getPlanDefinition(plan);
  const clients = Number(clientCount || 0);
  const estimates = Number(estimateCount || 0);

  return {
    plan: def.id,
    planLabel: getPlanLabel(plan),
    clientCount: clients,
    estimateCount: estimates,
    clientLimit: def.clientLimit,
    estimateLimit: def.estimateLimit,
    clientLimitLabel: formatPlanLimit(def.clientLimit),
    estimateLimitLabel: formatPlanLimit(def.estimateLimit),
    clientRemaining:
      def.clientLimit === null ? null : Math.max(0, def.clientLimit - clients),
    estimateRemaining:
      def.estimateLimit === null ? null : Math.max(0, def.estimateLimit - estimates),
    isClientLimitReached: !canAddClient(plan, clients),
    isEstimateLimitReached: !canSaveEstimate(plan, estimates),
  };
}

function getUpgradeHint(plan, type) {
  const id = normalizePlan(plan);
  if (id === PLAN_FREE) {
    return type === "client"
      ? "ライトプラン（月額500円）なら10件まで登録できます。"
      : "ライトプラン（月額500円）なら50件まで保存できます。";
  }
  if (id === PLAN_LIGHT) {
    return "プロプラン（月額1,500円）なら無制限に利用できます。";
  }
  return "上位プランへの変更をご検討ください。";
}

export function getClientLimitMessage(plan) {
  const def = getPlanDefinition(plan);
  return `${def.label}プランでは元請は${formatPlanLimit(def.clientLimit)}までです。\n${getUpgradeHint(plan, "client")}\n料金プラン画面からアップグレードしてください。`;
}

export function getEstimateLimitMessage(plan) {
  const def = getPlanDefinition(plan);
  return `${def.label}プランでは見積は${formatPlanLimit(def.estimateLimit)}まで保存できます。\n${getUpgradeHint(plan, "estimate")}\n料金プラン画面からアップグレードしてください。`;
}

export function getPdfUpgradeMessage() {
  return "PDF見積書・請求書はプロプラン以上で利用できます。\n料金プラン画面からアップグレードしてください。";
}

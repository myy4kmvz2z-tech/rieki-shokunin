export const PLAN_FREE = "free";
export const PLAN_LIGHT = "light";
export const PLAN_PRO = "pro";
export const PLAN_CORPORATE = "corporate";

export const DEFAULT_PLAN = PLAN_FREE;

export const PLAN_IDS = [PLAN_FREE, PLAN_LIGHT, PLAN_PRO, PLAN_CORPORATE];

export const LIGHT_PLAN_UPGRADE_MESSAGE =
  "この機能はライトプラン以上で利用できます。";

export const PRO_PLAN_UPGRADE_MESSAGE =
  "この機能はプロプラン以上で利用できます。";

export const PLAN_CATALOG = [
  {
    id: PLAN_FREE,
    label: "無料",
    priceDisplay: "¥0",
    priceSub: "",
    clientLimit: 3,
    estimateLimit: 10,
    features: ["元請 3件", "見積 10件", "基本見積", "利益計算"],
    cta: "無料で始める",
    popular: false,
  },
  {
    id: PLAN_LIGHT,
    label: "ライト",
    priceDisplay: "¥500",
    priceSub: "/月",
    clientLimit: 10,
    estimateLimit: 50,
    features: ["元請 10件", "見積 50件", "PDF見積書", "PDF請求書"],
    cta: "ライトにアップグレード",
    popular: false,
  },
  {
    id: PLAN_PRO,
    label: "プロ",
    priceDisplay: "¥1,500",
    priceSub: "/月",
    clientLimit: null,
    estimateLimit: null,
    features: [
      "元請 無制限",
      "見積 無制限",
      "PDF",
      "AI利益診断",
      "利益ダッシュボード",
      "利益シミュレーター",
      "AI社長レポート",
    ],
    cta: "プロにアップグレード",
    popular: true,
    popularLabel: "★★★★★ 人気",
  },
  {
    id: PLAN_CORPORATE,
    label: "法人",
    priceDisplay: "¥3,000〜",
    priceSub: "/月",
    clientLimit: null,
    estimateLimit: null,
    features: ["社員共有", "クラウド保存", "複数端末", "今後の管理機能"],
    cta: "お問い合わせ",
    ctaKind: "contact",
    popular: false,
  },
];

export function normalizePlan(plan) {
  return PLAN_IDS.includes(plan) ? plan : PLAN_FREE;
}

export function getPlanDefinition(plan) {
  return PLAN_CATALOG.find((item) => item.id === normalizePlan(plan)) ?? PLAN_CATALOG[0];
}

export function getPlanLabel(plan) {
  return getPlanDefinition(plan).label;
}

export function getPlanShortLabel(plan) {
  return getPlanDefinition(plan).label;
}

export function formatPlanLimit(limit) {
  return limit === null ? "無制限" : `${limit}件`;
}

export function isAtLeastLight(plan) {
  const id = normalizePlan(plan);
  return id === PLAN_LIGHT || id === PLAN_PRO || id === PLAN_CORPORATE;
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
  return isAtLeastLight(plan);
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

export function getLightPlanUpgradeMessage() {
  return LIGHT_PLAN_UPGRADE_MESSAGE;
}

export function getProPlanUpgradeMessage() {
  return PRO_PLAN_UPGRADE_MESSAGE;
}

export function getClientLimitMessage(plan) {
  const id = normalizePlan(plan);
  if (id === PLAN_FREE) return LIGHT_PLAN_UPGRADE_MESSAGE;
  if (id === PLAN_LIGHT) return PRO_PLAN_UPGRADE_MESSAGE;
  return "上限に達しています。";
}

export function getEstimateLimitMessage(plan) {
  return getClientLimitMessage(plan);
}

export function getPdfUpgradeMessage(plan) {
  if (normalizePlan(plan) === PLAN_FREE) return LIGHT_PLAN_UPGRADE_MESSAGE;
  return PRO_PLAN_UPGRADE_MESSAGE;
}

export function getProFeatureMessage(plan) {
  if (!hasProFeatures(plan)) return PRO_PLAN_UPGRADE_MESSAGE;
  return "";
}

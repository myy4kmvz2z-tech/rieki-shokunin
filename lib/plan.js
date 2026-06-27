export const PLAN_FREE = "free";
export const PLAN_PRO = "pro";

export const DEFAULT_PLAN = PLAN_FREE;

export function normalizePlan(plan) {
  return plan === PLAN_PRO ? PLAN_PRO : PLAN_FREE;
}

export function isProPlan(plan) {
  return normalizePlan(plan) === PLAN_PRO;
}

export function getPlanLabel(plan) {
  return isProPlan(plan) ? "プロプラン" : "無料プラン";
}

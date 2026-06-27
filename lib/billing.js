export const FREE_CLIENT_LIMIT = 3;
export const CLIENT_BILLING_UNIT = 5;
export const CLIENT_BILLING_PRICE = 500;

export const FREE_ESTIMATE_LIMIT = 10;
export const ESTIMATE_BILLING_UNIT = 10;
export const ESTIMATE_BILLING_PRICE = 500;

export const CLIENT_BILLING_CONFIRM_MESSAGE =
  "元請の無料登録枠は3件までです。\n4件目以降は5件追加ごとに500円です。\n追加しますか？";

export const ESTIMATE_BILLING_CONFIRM_MESSAGE =
  "見積の無料保存枠は10件までです。\n11件目以降は10件追加ごとに500円です。\n保存しますか？";

export function sortClientsByOrder(clients) {
  return [...clients].sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));
}

export function sortEstimatesByOrder(estimates) {
  return [...estimates].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return Number(a.id ?? 0) - Number(b.id ?? 0);
  });
}

export function calcClientBilling(count) {
  const total = Number(count || 0);
  if (total <= FREE_CLIENT_LIMIT) return 0;
  return Math.ceil((total - FREE_CLIENT_LIMIT) / CLIENT_BILLING_UNIT) * CLIENT_BILLING_PRICE;
}

export function calcEstimateBilling(count) {
  const total = Number(count || 0);
  if (total <= FREE_ESTIMATE_LIMIT) return 0;
  return Math.ceil((total - FREE_ESTIMATE_LIMIT) / ESTIMATE_BILLING_UNIT) * ESTIMATE_BILLING_PRICE;
}

export function getUsageSummary(clientCount, estimateCount) {
  const clientBilling = calcClientBilling(clientCount);
  const estimateBilling = calcEstimateBilling(estimateCount);
  const clients = Number(clientCount || 0);
  const estimates = Number(estimateCount || 0);
  return {
    clientCount: clients,
    estimateCount: estimates,
    clientBilling,
    estimateBilling,
    totalBilling: clientBilling + estimateBilling,
    clientFreeRemaining: Math.max(0, FREE_CLIENT_LIMIT - clients),
    estimateFreeRemaining: Math.max(0, FREE_ESTIMATE_LIMIT - estimates),
    hasPaidClients: clients > FREE_CLIENT_LIMIT,
    hasPaidEstimates: estimates > FREE_ESTIMATE_LIMIT,
  };
}

export function isPaidClient(clients, clientId) {
  const sorted = sortClientsByOrder(clients);
  const index = sorted.findIndex((c) => c.id === clientId);
  return index >= FREE_CLIENT_LIMIT;
}

export function isPaidEstimate(estimates, estimateId) {
  const sorted = sortEstimatesByOrder(estimates);
  const index = sorted.findIndex((e) => e.id === estimateId);
  return index >= FREE_ESTIMATE_LIMIT;
}

export function requiresClientBillingConfirm(currentCount) {
  return Number(currentCount || 0) >= FREE_CLIENT_LIMIT;
}

export function requiresEstimateBillingConfirm(currentCount) {
  return Number(currentCount || 0) >= FREE_ESTIMATE_LIMIT;
}

export function formatBillingYen(amount) {
  return `¥${Number(amount || 0).toLocaleString()}`;
}

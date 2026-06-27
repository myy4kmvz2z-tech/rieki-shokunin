import { resolveEstimateFinancials } from "../utils/calcProfit";

export const PAYMENT_ESTIMATE = "estimate";
export const PAYMENT_ORDERED = "ordered";
export const PAYMENT_INVOICED = "invoiced";
export const PAYMENT_PENDING = "pending";
export const PAYMENT_PAID = "paid";

export const PAYMENT_FLOW = [
  { id: PAYMENT_ESTIMATE, label: "見積" },
  { id: PAYMENT_ORDERED, label: "受注" },
  { id: PAYMENT_INVOICED, label: "請求" },
  { id: PAYMENT_PENDING, label: "入金待ち" },
  { id: PAYMENT_PAID, label: "入金済" },
];

const LEGACY_STATUS_MAP = {
  unbilled: PAYMENT_ESTIMATE,
};

export function normalizePaymentStatus(status) {
  if (LEGACY_STATUS_MAP[status]) return LEGACY_STATUS_MAP[status];
  if (PAYMENT_FLOW.some((item) => item.id === status)) return status;
  return PAYMENT_ESTIMATE;
}

export function getPaymentStatusLabel(status) {
  const id = normalizePaymentStatus(status);
  return PAYMENT_FLOW.find((item) => item.id === id)?.label ?? "見積";
}

export function getNextPaymentStatus(status) {
  const id = normalizePaymentStatus(status);
  const index = PAYMENT_FLOW.findIndex((item) => item.id === id);
  if (index < 0 || index >= PAYMENT_FLOW.length - 1) return null;
  return PAYMENT_FLOW[index + 1].id;
}

export function getNextPaymentStatusLabel(status) {
  const next = getNextPaymentStatus(status);
  if (!next) return null;
  return getPaymentStatusLabel(next);
}

export function isPaidStatus(status) {
  return normalizePaymentStatus(status) === PAYMENT_PAID;
}

export function isPendingPaymentStatus(status) {
  return normalizePaymentStatus(status) === PAYMENT_PENDING;
}

export function isUnbilledAmountStatus(status) {
  const id = normalizePaymentStatus(status);
  return (
    id === PAYMENT_ESTIMATE ||
    id === PAYMENT_ORDERED ||
    id === PAYMENT_INVOICED
  );
}

function parseEstimateDate(createdAt) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function calcPaymentAmounts(estimates, { thisMonthOnly = true } = {}) {
  const now = new Date();
  let unbilledAmount = 0;
  let pendingPaymentAmount = 0;

  estimates.forEach((estimate) => {
    const date = parseEstimateDate(estimate.createdAt);
    if (thisMonthOnly) {
      const isThisMonth = !date || isSameMonth(date, now);
      if (!isThisMonth) return;
    }

    const { sales } = resolveEstimateFinancials(estimate);
    const status = normalizePaymentStatus(estimate.paymentStatus);

    if (isPendingPaymentStatus(status)) {
      pendingPaymentAmount += sales;
    } else if (isUnbilledAmountStatus(status)) {
      unbilledAmount += sales;
    }
  });

  return { unbilledAmount, pendingPaymentAmount };
}

export function withPaymentStatus(estimate, paymentStatus) {
  return {
    ...estimate,
    paymentStatus: normalizePaymentStatus(paymentStatus),
  };
}

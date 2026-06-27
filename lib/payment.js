import { resolveEstimateFinancials } from "../utils/calcProfit";

export const PAYMENT_ESTIMATE = "estimate";
export const PAYMENT_SENT = "sent";
export const PAYMENT_ORDERED = "ordered";
export const PAYMENT_INVOICED = "invoiced";
export const PAYMENT_PENDING = "pending";
export const PAYMENT_PAID = "paid";

export const PAYMENT_FLOW = [
  { id: PAYMENT_ESTIMATE, label: "見積中" },
  { id: PAYMENT_SENT, label: "送付済" },
  { id: PAYMENT_INVOICED, label: "請求済" },
  { id: PAYMENT_PENDING, label: "入金待ち" },
  { id: PAYMENT_PAID, label: "入金済" },
];

export const PAYMENT_STATUS_DISPLAY = {
  [PAYMENT_ESTIMATE]: { icon: "🟡", label: "見積中" },
  [PAYMENT_SENT]: { icon: "🔵", label: "送付済" },
  [PAYMENT_ORDERED]: { icon: "🔵", label: "送付済" },
  [PAYMENT_INVOICED]: { icon: "🟣", label: "請求済" },
  [PAYMENT_PENDING]: { icon: "🟠", label: "入金待ち" },
  [PAYMENT_PAID]: { icon: "🟢", label: "入金済" },
};

const LEGACY_STATUS_MAP = {
  unbilled: PAYMENT_ESTIMATE,
  ordered: PAYMENT_SENT,
};

const STATUS_ORDER = PAYMENT_FLOW.map((item) => item.id);

export function normalizePaymentStatus(status) {
  if (LEGACY_STATUS_MAP[status]) return LEGACY_STATUS_MAP[status];
  if (PAYMENT_FLOW.some((item) => item.id === status)) return status;
  return PAYMENT_ESTIMATE;
}

export function getPaymentStatusLabel(status) {
  const id = normalizePaymentStatus(status);
  return PAYMENT_STATUS_DISPLAY[id]?.label ?? PAYMENT_FLOW.find((item) => item.id === id)?.label ?? "見積中";
}

export function getPaymentStatusDisplay(status) {
  const id = normalizePaymentStatus(status);
  return PAYMENT_STATUS_DISPLAY[id] ?? PAYMENT_STATUS_DISPLAY[PAYMENT_ESTIMATE];
}

export function getStatusOrderIndex(status) {
  const id = normalizePaymentStatus(status);
  const index = STATUS_ORDER.indexOf(id);
  return index >= 0 ? index : 0;
}

export function getNextPaymentStatus(status) {
  const id = normalizePaymentStatus(status);
  const index = STATUS_ORDER.indexOf(id);
  if (index < 0 || index >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[index + 1];
}

export function getNextPaymentStatusLabel(status) {
  const next = getNextPaymentStatus(status);
  if (!next) return null;
  return getPaymentStatusLabel(next);
}

export function getStatusAfterSend(currentStatus, docType) {
  const current = normalizePaymentStatus(currentStatus);
  const currentIndex = getStatusOrderIndex(current);

  if (docType === "invoice") {
    const invoicedIndex = getStatusOrderIndex(PAYMENT_INVOICED);
    return currentIndex >= invoicedIndex ? current : PAYMENT_INVOICED;
  }

  const sentIndex = getStatusOrderIndex(PAYMENT_SENT);
  return currentIndex >= sentIndex ? current : PAYMENT_SENT;
}

export function countEstimatesByStatus(estimates) {
  const counts = {
    estimate: 0,
    sent: 0,
    invoiced: 0,
    pending: 0,
    paid: 0,
  };

  estimates.forEach((estimate) => {
    const status = normalizePaymentStatus(estimate.paymentStatus);
    if (status === PAYMENT_ESTIMATE) counts.estimate += 1;
    else if (status === PAYMENT_SENT) counts.sent += 1;
    else if (status === PAYMENT_INVOICED) counts.invoiced += 1;
    else if (status === PAYMENT_PENDING) counts.pending += 1;
    else if (status === PAYMENT_PAID) counts.paid += 1;
  });

  return counts;
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
    id === PAYMENT_SENT ||
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

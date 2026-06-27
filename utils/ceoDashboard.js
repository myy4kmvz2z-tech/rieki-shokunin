import { resolveEstimateFinancials } from "./calcProfit";

const DEFAULT_MONTHLY_TARGET = 500000;

const CIRCLED_NUMBERS = ["①", "②", "③", "④", "⑤"];

function parseEstimateDate(createdAt) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getPaymentStatus(estimate) {
  const status = estimate?.paymentStatus;
  if (status === "pending" || status === "paid" || status === "unbilled") {
    return status;
  }
  return "unbilled";
}

function accumulateEstimate(
  estimate,
  { clientRates, unbilledAmount, pendingPaymentAmount, includeBilling, includeRates }
) {
  const { profit, sales, rate } = resolveEstimateFinancials(estimate);

  if (includeRates && estimate.client) {
    if (!clientRates[estimate.client]) {
      clientRates[estimate.client] = { sum: 0, count: 0 };
    }
    clientRates[estimate.client].sum += rate;
    clientRates[estimate.client].count += 1;
  }

  if (includeBilling) {
    const status = getPaymentStatus(estimate);
    if (status === "pending") {
      pendingPaymentAmount.value += sales;
    } else if (status !== "paid") {
      unbilledAmount.value += sales;
    }
  }

  return { profit, sales, rate };
}

function buildClientRanking(clientRates) {
  return Object.entries(clientRates)
    .map(([name, data]) => ({
      name,
      profitRate: data.count > 0 ? data.sum / data.count : 0,
    }))
    .filter((item) => item.profitRate > 0)
    .sort((a, b) => b.profitRate - a.profitRate)
    .slice(0, 3)
    .map((item, index) => ({
      ...item,
      rankLabel: CIRCLED_NUMBERS[index] || `${index + 1}.`,
      profitRateLabel: `${Math.round(item.profitRate)}%`,
    }));
}

export function formatCompactYen(amount) {
  const value = Math.max(0, Math.round(Number(amount || 0)));
  if (value >= 10000) {
    const man = value / 10000;
    if (value % 10000 === 0) {
      return `${man.toLocaleString()}万円`;
    }
    return `${man.toFixed(1).replace(/\.0$/, "")}万円`;
  }
  return `${value.toLocaleString()}円`;
}

export function buildCeoDashboard(estimates, targets = {}) {
  const now = new Date();
  const monthlyTargetProfit = Number(
    targets.monthlyTargetProfit ?? DEFAULT_MONTHLY_TARGET
  );

  let monthProfit = 0;
  let monthSales = 0;
  const monthClientRates = {};
  const allClientRates = {};
  const unbilledAmount = { value: 0 };
  const pendingPaymentAmount = { value: 0 };

  estimates.forEach((estimate) => {
    const date = parseEstimateDate(estimate.createdAt);
    const isThisMonth = !date || isSameMonth(date, now);

    if (isThisMonth) {
      const result = accumulateEstimate(estimate, {
        clientRates: monthClientRates,
        unbilledAmount,
        pendingPaymentAmount,
        includeBilling: true,
        includeRates: true,
      });
      monthProfit += result.profit;
      monthSales += result.sales;
    }

    accumulateEstimate(estimate, {
      clientRates: allClientRates,
      unbilledAmount: { value: 0 },
      pendingPaymentAmount: { value: 0 },
      includeBilling: false,
      includeRates: true,
    });
  });

  const profitRate = monthSales > 0 ? (monthProfit / monthSales) * 100 : 0;
  const monthlyRemaining = Math.max(0, monthlyTargetProfit - monthProfit);

  const rankingSource =
    Object.keys(monthClientRates).length > 0 ? monthClientRates : allClientRates;

  return {
    monthProfit,
    monthSales,
    profitRate,
    monthlyTargetProfit,
    monthlyRemaining,
    monthlyRemainingLabel: formatCompactYen(monthlyRemaining),
    unbilledAmount: unbilledAmount.value,
    pendingPaymentAmount: pendingPaymentAmount.value,
    clientRanking: buildClientRanking(rankingSource),
  };
}

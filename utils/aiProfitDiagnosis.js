import {
  PROFIT_RATE_GOOD_THRESHOLD,
  PROFIT_RATE_WARNING_THRESHOLD,
  resolveEstimateFinancials,
  yen,
} from "./calcProfit";
import { formatCompactYen } from "./ceoDashboard";

function parseEstimateDate(createdAt) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function calcTargetUnitPrice({ totalCost, area, discount, targetRate = 20 }) {
  const sqm = Number(area || 0);
  const cost = Number(totalCost || 0);
  const disc = Number(discount || 0);
  const target = Number(targetRate || 20);
  if (sqm <= 0 || target >= 100) return 0;
  const requiredSales = cost / (1 - target / 100);
  return Math.ceil((requiredSales + disc) / sqm);
}

export function getOrderJudgment(rate) {
  const value = Number(rate || 0);
  if (value >= PROFIT_RATE_GOOD_THRESHOLD) {
    return { icon: "🟢", label: "受注推奨", color: "#22c55e" };
  }
  if (value >= PROFIT_RATE_WARNING_THRESHOLD) {
    return { icon: "🟡", label: "利益少なめ", color: "#eab308" };
  }
  return { icon: "🔴", label: "受注注意", color: "#ef4444" };
}

export function getAiProfitDiagnosis({
  rate,
  totalCost,
  area,
  effectiveSellingUnitPrice,
  discount,
  profit,
  targetProfitRate = PROFIT_RATE_GOOD_THRESHOLD,
}) {
  const value = Number(rate || 0);
  const sqm = Number(area || 0);
  const cost = Number(totalCost || 0);
  const currentPrice = Number(effectiveSellingUnitPrice || 0);
  const disc = Number(discount || 0);
  const currentProfit = Number(profit || 0);
  const target = Number(targetProfitRate || PROFIT_RATE_GOOD_THRESHOLD);

  let icon;
  let level;
  let message;
  let color;

  if (value >= PROFIT_RATE_GOOD_THRESHOLD) {
    icon = "🟢";
    level = "良い";
    message = "目標利益率を達成しています。";
    color = "#22c55e";
  } else if (value >= PROFIT_RATE_WARNING_THRESHOLD) {
    icon = "🟡";
    level = "注意";
    color = "#eab308";
  } else {
    icon = "🔴";
    level = "危険";
    message = "この見積は利益が低すぎます。";
    color = "#ef4444";
  }

  const recommendedUnitPrice = calcTargetUnitPrice({
    totalCost: cost,
    area: sqm,
    discount: disc,
    targetRate: target,
  });
  const unitPriceIncrease = Math.max(0, recommendedUnitPrice - currentPrice);

  if (level === "注意") {
    message =
      unitPriceIncrease > 0
        ? `あと${unitPriceIncrease.toLocaleString()}円/㎡上げると利益率${target}%になります。`
        : "利益率が少し低めです。";
  }

  const targetSales = recommendedUnitPrice * sqm - disc;
  const targetProfit = targetSales - cost;
  const profitIncrease = Math.max(0, Math.round(targetProfit - currentProfit));

  let discountImpactText = "値引きなし";
  if (disc > 0 && sqm > 0 && currentPrice > 0) {
    const salesWithoutDiscount = currentPrice * sqm;
    const rateWithoutDiscount =
      salesWithoutDiscount > 0
        ? ((salesWithoutDiscount - cost) / salesWithoutDiscount) * 100
        : 0;
    discountImpactText = `値引き${yen(disc)}で利益率 ${value.toFixed(1)}%（値引き前 ${rateWithoutDiscount.toFixed(1)}%）`;
  }

  const orderJudgment = getOrderJudgment(value);

  return {
    status: { icon, level, message, color },
    recommendedUnitPrice,
    unitPriceIncrease,
    profitIncrease,
    discountImpactText,
    orderJudgment,
    canDiagnose: sqm > 0 && cost >= 0,
  };
}

export function buildCeoComments(estimates, options = {}) {
  const comments = [];
  const now = new Date();
  const monthlyTargetProfit = Number(options.monthlyTargetProfit || 0);
  const monthProfit = Number(options.monthProfit || 0);

  const clientRates = {};
  let computedMonthProfit = 0;
  let monthDiscountTotal = 0;
  let lowRateCandidate = null;

  estimates.forEach((estimate) => {
    const date = parseEstimateDate(estimate.createdAt);
    const isThisMonth = !date || isSameMonth(date, now);
    const financials = resolveEstimateFinancials(estimate);
    const { profit, rate, effectiveSellingUnitPrice, cost } = financials;
    const disc = Number(estimate.discount || 0);
    const targetRate = Number(estimate.targetProfitRate ?? PROFIT_RATE_GOOD_THRESHOLD);

    if (isThisMonth) {
      computedMonthProfit += profit;
      monthDiscountTotal += disc;

      if (estimate.client) {
        if (!clientRates[estimate.client]) {
          clientRates[estimate.client] = { sum: 0, count: 0 };
        }
        clientRates[estimate.client].sum += rate;
        clientRates[estimate.client].count += 1;
      }

      if (rate < targetRate && Number(estimate.area || 0) > 0) {
        const recommendedUnitPrice = calcTargetUnitPrice({
          totalCost: cost,
          area: estimate.area,
          discount: disc,
          targetRate,
        });
        const increase = Math.max(0, recommendedUnitPrice - Number(effectiveSellingUnitPrice || 0));
        if (
          increase > 0 &&
          (!lowRateCandidate || increase > lowRateCandidate.increase)
        ) {
          lowRateCandidate = {
            increase,
            targetRate,
          };
        }
      }
    }
  });

  const effectiveMonthProfit = monthProfit || computedMonthProfit;

  if (monthlyTargetProfit > effectiveMonthProfit) {
    const remaining = monthlyTargetProfit - effectiveMonthProfit;
    if (remaining > 0) {
      comments.push(`あと${formatCompactYen(remaining)}で目標達成です。`);
    }
  }

  const topClient = Object.entries(clientRates)
    .map(([name, data]) => ({
      name,
      avgRate: data.count > 0 ? data.sum / data.count : 0,
    }))
    .filter((item) => item.avgRate > 0)
    .sort((a, b) => b.avgRate - a.avgRate)[0];

  if (topClient) {
    comments.push(`今月は${topClient.name}の利益率が一番高いです。`);
  }

  if (monthDiscountTotal > 0) {
    comments.push("値引きが利益率を下げています。");
  }

  if (lowRateCandidate) {
    comments.push(
      `販売単価を${lowRateCandidate.increase.toLocaleString()}円/㎡上げると利益率${lowRateCandidate.targetRate}%になります。`
    );
  }

  if (comments.length === 0) {
    return ["見積を増やすと、AI社長コメントが表示されます。"];
  }

  return comments.slice(0, 5);
}

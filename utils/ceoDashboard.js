import { WORK_TYPES } from "../lib/constants";
import { resolveEstimateFinancials, yen } from "./calcProfit";

export const WORK_TYPE_SHORT = {
  "クロス SP": "SP",
  "クロス AA": "AA",
  CF: "CF",
  フロアタイル: "フロア",
  シート: "シート",
};

const DEFAULT_MONTHLY_TARGET = 500000;
const DEFAULT_DAILY_TARGET = 20000;

function parseEstimateDate(createdAt) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function buildCeoDashboard(estimates, targets = {}) {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const monthlyTargetProfit = Number(
    targets.monthlyTargetProfit ?? DEFAULT_MONTHLY_TARGET
  );
  const dailyTargetProfit = Number(targets.dailyTargetProfit ?? DEFAULT_DAILY_TARGET);

  let todayProfit = 0;
  let todaySales = 0;
  let monthProfit = 0;
  let monthSales = 0;
  const clientProfit = {};
  const workTypeProfit = Object.fromEntries(WORK_TYPES.map((name) => [name, 0]));

  estimates.forEach((estimate) => {
    const date = parseEstimateDate(estimate.createdAt);
    const { profit, sales } = resolveEstimateFinancials(estimate);

    if (date && isSameDay(date, now)) {
      todayProfit += profit;
      todaySales += sales;
    }

    if (date && isSameMonth(date, now)) {
      monthProfit += profit;
      monthSales += sales;

      if (estimate.client) {
        clientProfit[estimate.client] = (clientProfit[estimate.client] || 0) + profit;
      }

      if (workTypeProfit[estimate.workType] !== undefined) {
        workTypeProfit[estimate.workType] += profit;
      }
    }
  });

  const profitRate = monthSales > 0 ? (monthProfit / monthSales) * 100 : 0;
  const todayProfitRate = todaySales > 0 ? (todayProfit / todaySales) * 100 : 0;
  const monthlyRemaining = Math.max(0, monthlyTargetProfit - monthProfit);
  const dailyRemaining = Math.max(0, dailyTargetProfit - todayProfit);
  const annualProfitForecast =
    dayOfMonth > 0 && monthProfit > 0
      ? Math.round((monthProfit / dayOfMonth) * 365)
      : 0;

  const clientRanking = Object.entries(clientProfit)
    .map(([name, profit]) => ({ name, profit }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 3);

  const workTypeRanking = WORK_TYPES.map((name) => ({
    name,
    shortName: WORK_TYPE_SHORT[name] || name,
    profit: workTypeProfit[name],
  })).sort((a, b) => b.profit - a.profit);

  const recentEstimates = [...estimates]
    .sort((a, b) => {
      const dateA = parseEstimateDate(a.createdAt)?.getTime() ?? Number(a.id || 0);
      const dateB = parseEstimateDate(b.createdAt)?.getTime() ?? Number(b.id || 0);
      return dateB - dateA;
    })
    .slice(0, 5)
    .map((estimate) => {
      const { profit, sales, rate } = resolveEstimateFinancials(estimate);
      return {
        id: estimate.id,
        siteName: estimate.siteName || "（現場名なし）",
        client: estimate.client || "—",
        workType: WORK_TYPE_SHORT[estimate.workType] || estimate.workType || "—",
        profit,
        sales,
        rate,
        profitLabel: yen(profit),
        salesLabel: yen(sales),
      };
    });

  return {
    todayProfit,
    todaySales,
    todayProfitRate,
    monthProfit,
    monthSales,
    profitRate,
    monthlyTargetProfit,
    monthlyRemaining,
    dailyTargetProfit,
    dailyRemaining,
    annualProfitForecast,
    clientRanking,
    workTypeRanking,
    recentEstimates,
    estimateCount: estimates.length,
  };
}

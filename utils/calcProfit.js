import { WORK_TYPES, WORK_TYPE_FIELD, DEFAULT_LABOR_UNIT_PRICE, DEFAULT_OUTSOURCING_MODE, DEFAULT_TARGET_PROFIT_RATE } from "../lib/constants";
import {
  calcTransportTotal,
  getTransportDetailLabel,
  getTransportModeLabel,
  normalizeEstimateTransport,
} from "./calcTransport";

export const yen = (n) => `¥${Number(n || 0).toLocaleString()}`;

export const LABOR_COUNT_STEP = 0.5;

export function normalizeLaborCount(value) {
  const n = Number(value || 0);
  if (Number.isNaN(n) || n <= 0) return 0;
  return Math.round(n / LABOR_COUNT_STEP) * LABOR_COUNT_STEP;
}

export function formatLaborCountLabel(count) {
  return `${normalizeLaborCount(count).toFixed(1)}人工`;
}

export { DEFAULT_LABOR_UNIT_PRICE, DEFAULT_TARGET_PROFIT_RATE };
export const PROFIT_RATE_GOOD_THRESHOLD = 20;
export const PROFIT_RATE_WARNING_THRESHOLD = 10;

export function getTargetProfitRate(estimate) {
  return Number(estimate?.targetProfitRate ?? DEFAULT_TARGET_PROFIT_RATE);
}

export function getProfitRateJudgment(rate) {
  const value = Number(rate || 0);
  if (value >= PROFIT_RATE_GOOD_THRESHOLD) {
    return { level: "good", label: "良い", icon: "✅" };
  }
  if (value >= PROFIT_RATE_WARNING_THRESHOLD) {
    return { level: "warning", label: "注意", icon: "⚠️" };
  }
  return { level: "danger", label: "危険", icon: "🚨" };
}

export function formatProfitRateJudgment(rate) {
  const judgment = getProfitRateJudgment(rate);
  return `利益率 ${Number(rate || 0).toFixed(1)}%　${judgment.icon} ${judgment.label}`;
}

export function calcRecommendedSellingUnitPrice(costUnitPrice, pasteLabor) {
  return Number(costUnitPrice || 0) + Number(pasteLabor || 0);
}

export function calcProfitSimulator({
  totalCost,
  area,
  desiredProfitRate,
  desiredProfitAmount,
}) {
  const sqm = Number(area || 0);
  const cost = Number(totalCost || 0);
  const rate = Number(desiredProfitRate ?? DEFAULT_TARGET_PROFIT_RATE);
  const profitAmount = Number(desiredProfitAmount || 0);
  const base = {
    totalCost: cost,
    desiredProfitRate: rate,
    desiredProfitAmount: profitAmount,
    recommendedUnitPrice: 0,
    mode: null,
    message: "",
    canCalculate: false,
  };

  if (sqm <= 0) {
    return { ...base, message: "施工面積を入力してください" };
  }

  if (profitAmount > 0) {
    const recommendedUnitPrice = Math.ceil((cost + profitAmount) / sqm);
    return {
      ...base,
      recommendedUnitPrice,
      mode: "amount",
      message: `この単価なら利益${yen(profitAmount)}残ります`,
      canCalculate: true,
    };
  }

  if (rate >= 100) {
    return { ...base, message: "希望利益率は100%未満で入力してください" };
  }

  const sales = cost / (1 - rate / 100);
  const recommendedUnitPrice = Math.ceil(sales / sqm);
  return {
    ...base,
    recommendedUnitPrice,
    mode: "rate",
    message: `この単価なら利益率${rate}%になります`,
    canCalculate: true,
  };
}

export function calcEffectiveSellingUnitPrice(inputSellingUnitPrice, recommendedSellingUnitPrice) {
  const input = Number(inputSellingUnitPrice || 0);
  if (input > 0) return input;
  return Number(recommendedSellingUnitPrice || 0);
}

export function formatSalesDisplay({
  area,
  effectiveSellingUnitPrice,
  sellingUnitPrice,
  unitPrice,
  discount,
  sales,
}) {
  const sqm = Number(area || 0);
  const price = Number(
    effectiveSellingUnitPrice ?? sellingUnitPrice ?? unitPrice ?? 0
  );
  const disc = Number(discount || 0);
  let formula = `${sqm}㎡ × 有効販売単価 ${yen(price)}/㎡`;
  if (disc > 0) formula += ` - 値引き ${yen(disc)}`;
  formula += ` = ${yen(sales)}`;
  return formula;
}

export function calcOutsourcingCost({
  outsourcingMode,
  laborCount,
  laborUnitPrice,
  outsourcingSqmUnitPrice,
  area,
  labor,
}) {
  const mode = outsourcingMode === "sqm" ? "sqm" : "labor";

  if (mode === "sqm") {
    const sqmPrice = Number(outsourcingSqmUnitPrice || 0);
    const sqm = Number(area || 0);
    if (sqmPrice > 0 && sqm > 0) {
      return sqm * sqmPrice;
    }
    return Number(labor || 0);
  }

  const count = normalizeLaborCount(laborCount);
  if (count > 0) {
    return count * Number(laborUnitPrice || 0);
  }
  return Number(labor || 0);
}

export function getOutsourcingModeLabel(outsourcingMode) {
  return outsourcingMode === "sqm" ? "請負単価（㎡）" : "常用単価（1人工）";
}

export function normalizeEstimateOutsourcing(
  estimate,
  standardLaborUnitPrice = DEFAULT_LABOR_UNIT_PRICE
) {
  const outsourcingMode = estimate?.outsourcingMode === "sqm" ? "sqm" : "labor";
  const laborCount = normalizeLaborCount(estimate?.laborCount ?? 0);
  const laborUnitPrice = Number(estimate?.laborUnitPrice ?? standardLaborUnitPrice);
  const outsourcingSqmUnitPrice = Number(estimate?.outsourcingSqmUnitPrice ?? 0);
  const labor = calcOutsourcingCost({
    outsourcingMode,
    laborCount,
    laborUnitPrice,
    outsourcingSqmUnitPrice,
    area: estimate?.area,
    labor: estimate?.labor ?? 0,
  });

  return {
    outsourcingMode,
    laborCount,
    laborUnitPrice,
    outsourcingSqmUnitPrice,
    labor,
  };
}

export const normalizeEstimateLabor = normalizeEstimateOutsourcing;

export function formatOutsourcingDisplay({
  outsourcingMode,
  laborCount,
  laborUnitPrice,
  outsourcingSqmUnitPrice,
  area,
  labor,
}) {
  const mode = outsourcingMode === "sqm" ? "sqm" : "labor";
  const amount = calcOutsourcingCost({
    outsourcingMode: mode,
    laborCount,
    laborUnitPrice,
    outsourcingSqmUnitPrice,
    area,
    labor,
  });

  if (mode === "sqm") {
    const sqm = Number(area || 0);
    const price = Number(outsourcingSqmUnitPrice || 0);
    if (price > 0 && sqm > 0) {
      return `${sqm}㎡ × 請負単価 ${yen(price)}/㎡ = ${yen(amount)}`;
    }
    if (amount > 0) {
      return `外注費 ${yen(amount)}`;
    }
    return `${sqm}㎡ × 請負単価 ${yen(price)}/㎡ = ${yen(amount)}`;
  }

  const count = normalizeLaborCount(laborCount);
  const unit = Number(laborUnitPrice || 0);
  if (count > 0) {
    return `${formatLaborCountLabel(count)} × 常用単価 ${yen(unit)} = ${yen(amount)}`;
  }
  if (amount > 0) {
    return `外注費 ${yen(amount)}`;
  }
  return `${formatLaborCountLabel(count)} × 常用単価 ${yen(unit)} = ${yen(amount)}`;
}

export function formatOutsourcingCostLine(params) {
  const amount = calcOutsourcingCost(params);
  const mode = params.outsourcingMode === "sqm" ? "sqm" : "labor";

  if (mode === "sqm") {
    const sqm = Number(params.area || 0);
    const price = Number(params.outsourcingSqmUnitPrice || 0);
    if (price > 0 && sqm > 0) {
      return `+ ${sqm}㎡ × 請負単価 ${yen(price)}/㎡ = ${yen(amount)}`;
    }
    return `+ 外注費 ${yen(amount)}`;
  }

  const count = normalizeLaborCount(params.laborCount);
  if (count > 0) {
    return `+ ${formatLaborCountLabel(count)} × 常用単価 ${yen(params.laborUnitPrice)} = ${yen(amount)}`;
  }
  return `+ 外注費 ${yen(amount)}`;
}

export function formatCostDisplayLines({
  area,
  costUnitPrice,
  outsourcingMode,
  laborCount,
  laborUnitPrice,
  outsourcingSqmUnitPrice,
  labor,
  transportCost,
  parkingFee,
  cost,
}) {
  const lines = [`${Number(area || 0)}㎡ × 原価単価 ${yen(costUnitPrice)}/㎡`];
  lines.push(
    formatOutsourcingCostLine({
      outsourcingMode,
      laborCount,
      laborUnitPrice,
      outsourcingSqmUnitPrice,
      area,
      labor,
    })
  );
  lines.push(`+ 交通費 ${yen(transportCost || 0)}`);
  lines.push(`+ 駐車場代 ${yen(parkingFee || 0)}`);
  lines.push(`= ${yen(cost)}`);
  return lines;
}

export function formatCostExtrasDisplay(params) {
  return `${formatOutsourcingDisplay(params)} / 交通費 ${yen(params.transportCost || 0)} / 駐車場代 ${yen(params.parkingFee || 0)}`;
}

export function formatCostDisplay(params) {
  return formatCostDisplayLines(params).join("\n");
}

export function getEstimateDisplayTotals(estimate, standardLaborUnitPrice) {
  return resolveEstimateFinancials(estimate, standardLaborUnitPrice);
}

export function resolveEstimateFinancials(estimate, standardLaborUnitPrice) {
  const transport = normalizeEstimateTransport(estimate);
  const targetProfitRate = getTargetProfitRate(estimate);
  const laborFields = normalizeEstimateOutsourcing(estimate, standardLaborUnitPrice);
  const financials = calcEstimateTotals({
    area: estimate.area,
    material: estimate.material,
    pasteLabor: estimate.pasteLabor ?? 0,
    substrate: estimate.substrate ?? 0,
    auxiliary: estimate.auxiliary ?? 0,
    waste: estimate.waste ?? 0,
    sellingUnitPrice: estimate.unitPrice ?? 0,
    discount: estimate.discount ?? 0,
    outsourcingMode: laborFields.outsourcingMode,
    laborCount: laborFields.laborCount,
    laborUnitPrice: laborFields.laborUnitPrice,
    outsourcingSqmUnitPrice: laborFields.outsourcingSqmUnitPrice,
    labor: estimate.labor ?? 0,
    transportMode: transport.transportMode,
    transportFeeMethod: transport.transportFeeMethod,
    distanceKm: transport.distanceKm,
    kmRate: transport.kmRate,
    tripType: transport.tripType,
    fixedTransport: transport.fixedTransport,
    fuelEfficiencyKmPerL: transport.fuelEfficiencyKmPerL,
    gasolinePricePerL: transport.gasolinePricePerL,
    highwayToll: transport.highwayToll,
    parkingFee: transport.parkingFee,
  });

  return {
    area: estimate.area,
    inputSellingUnitPrice: financials.inputSellingUnitPrice,
    sellingUnitPrice: financials.inputSellingUnitPrice,
    effectiveSellingUnitPrice: financials.effectiveSellingUnitPrice,
    usesRecommendedSellingUnitPrice: financials.usesRecommendedSellingUnitPrice,
    unitPrice: financials.inputSellingUnitPrice,
    discount: financials.discount,
    sales: financials.sales,
    costUnitPrice: financials.costUnitPrice,
    pasteLabor: financials.pasteLabor,
    recommendedSellingUnitPrice: financials.recommendedSellingUnitPrice,
    targetProfitRate,
    outsourcingMode: financials.outsourcingMode,
    laborCount: financials.laborCount,
    laborUnitPrice: financials.laborUnitPrice,
    outsourcingSqmUnitPrice: financials.outsourcingSqmUnitPrice,
    transportCost: financials.transportCost,
    highwayToll: financials.highwayToll,
    travelCostTotal: financials.travelCostTotal,
    parkingFee: financials.parkingFee,
    labor: financials.labor,
    cost: financials.cost,
    profit: financials.profit,
    rate: financials.rate,
  };
}

export function getEstimateLine(estimate, standardLaborUnitPrice) {
  const display = resolveEstimateFinancials(estimate, standardLaborUnitPrice);
  const discount = estimate.discount ?? 0;
  const lineAmount = estimate.area * display.effectiveSellingUnitPrice;
  const transport = normalizeEstimateTransport(estimate);
  const laborFields = normalizeEstimateOutsourcing(estimate, standardLaborUnitPrice);

  return {
    inputSellingUnitPrice: display.inputSellingUnitPrice,
    sellingUnitPrice: display.inputSellingUnitPrice,
    effectiveSellingUnitPrice: display.effectiveSellingUnitPrice,
    unitPrice: display.effectiveSellingUnitPrice,
    discount,
    lineAmount,
    ...laborFields,
    transportCost: transport.transportCost,
    parkingFee: transport.parkingFee,
    transportMode: transport.transportMode,
    transportModeLabel: getTransportModeLabel(estimate),
    transportDetailLabel: getTransportDetailLabel(estimate),
  };
}

export function getProfitRateColorBand(rate) {
  const value = Number(rate || 0);
  if (value >= 20) {
    return { icon: "🟢", label: "20%以上", color: "#22c55e" };
  }
  if (value >= 10) {
    return { icon: "🟡", label: "10〜19.9%", color: "#eab308" };
  }
  return { icon: "🔴", label: "10%未満", color: "#ef4444" };
}

export function getProfitImprovementAdvice({
  rate,
  totalCost,
  area,
  effectiveSellingUnitPrice,
  discount,
  targetProfitRate = PROFIT_RATE_GOOD_THRESHOLD,
}) {
  const value = Number(rate || 0);
  const sqm = Number(area || 0);
  const cost = Number(totalCost || 0);
  const currentPrice = Number(effectiveSellingUnitPrice || 0);
  const disc = Number(discount || 0);
  const target = Number(targetProfitRate ?? PROFIT_RATE_GOOD_THRESHOLD);

  let icon;
  let message;
  let color;

  if (value >= PROFIT_RATE_GOOD_THRESHOLD) {
    icon = "🟢";
    message = "目標利益率を達成しています。";
    color = "#22c55e";
  } else if (value >= PROFIT_RATE_WARNING_THRESHOLD) {
    icon = "🟡";
    message = "利益率が少し低めです。";
    color = "#eab308";
  } else {
    icon = "🔴";
    message = "利益率が低すぎます。";
    color = "#ef4444";
  }

  let unitPriceIncrease = null;
  let improvementMessage = null;

  if (value < target && sqm > 0 && target < 100) {
    const requiredSales = cost / (1 - target / 100);
    const requiredUnitPrice = (requiredSales + disc) / sqm;
    const increase = Math.ceil(requiredUnitPrice - currentPrice);
    if (increase > 0) {
      unitPriceIncrease = increase;
      improvementMessage = `販売単価を\nあと${increase.toLocaleString()}円/㎡上げると\n利益率${target}%になります。`;
    }
  }

  return { icon, message, color, unitPriceIncrease, improvementMessage };
}

export function getCostStructureForClient(clients, clientName, workType) {
  const c = clients.find((x) => x.name === clientName);
  if (!c) {
    return {
      material: 0,
      pasteLabor: 0,
      substrate: 0,
      auxiliary: 0,
      waste: 0,
      transport: 0,
      standardLaborUnitPrice: DEFAULT_LABOR_UNIT_PRICE,
      standardOutsourcingSqmUnitPrice: 0,
      standardOutsourcingMode: DEFAULT_OUTSOURCING_MODE,
      standardTargetProfitRate: DEFAULT_TARGET_PROFIT_RATE,
    };
  }
  const field = WORK_TYPE_FIELD[workType];
  return {
    material: field ? Number(c[field] || 0) : 0,
    pasteLabor: Number(c.pasteLabor ?? 0),
    substrate: Number(c.substrate ?? 0),
    auxiliary: Number(c.auxiliary ?? 0),
    waste: Number(c.waste ?? 0),
    transport: Number(c.transport ?? 0),
    standardLaborUnitPrice: Number(c.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE),
    standardOutsourcingSqmUnitPrice: Number(c.standardOutsourcingSqmUnitPrice ?? 0),
    standardOutsourcingMode:
      c.standardOutsourcingMode === "sqm" ? "sqm" : "labor",
    standardTargetProfitRate: Number(c.standardTargetProfitRate ?? DEFAULT_TARGET_PROFIT_RATE),
  };
}

export function calcCostUnitPrice({ material, substrate, auxiliary, waste }) {
  return (
    Number(material || 0) +
    Number(substrate || 0) +
    Number(auxiliary || 0) +
    Number(waste || 0)
  );
}

export function calcEstimateTotals({
  area,
  material,
  pasteLabor,
  substrate,
  auxiliary,
  waste,
  sellingUnitPrice,
  unitPrice,
  discount,
  outsourcingMode,
  laborCount,
  laborUnitPrice,
  outsourcingSqmUnitPrice,
  labor,
  transportMode,
  distanceKm,
  kmRate,
  tripType,
  fixedTransport,
  transportFeeMethod,
  fuelEfficiencyKmPerL,
  gasolinePricePerL,
  highwayToll,
  parkingFee,
}) {
  const costUnitPrice = calcCostUnitPrice({
    material,
    substrate,
    auxiliary,
    waste,
  });
  const pasteLaborAmount = Number(pasteLabor || 0);
  const inputSellingUnitPrice = Number(sellingUnitPrice ?? unitPrice ?? 0);
  const recommendedSellingUnitPrice = calcRecommendedSellingUnitPrice(
    costUnitPrice,
    pasteLaborAmount
  );
  const effectiveSellingUnitPrice = calcEffectiveSellingUnitPrice(
    inputSellingUnitPrice,
    recommendedSellingUnitPrice
  );
  const usesRecommendedSellingUnitPrice =
    inputSellingUnitPrice <= 0 && effectiveSellingUnitPrice > 0;
  const discountAmount = Number(discount || 0);
  const outsourcingModeValue = outsourcingMode === "sqm" ? "sqm" : "labor";
  const outsourcingCost = calcOutsourcingCost({
    outsourcingMode: outsourcingModeValue,
    laborCount,
    laborUnitPrice,
    outsourcingSqmUnitPrice,
    area,
    labor,
  });
  const transportCost = calcTransportTotal({
    transportMode,
    transportFeeMethod,
    distanceKm,
    kmRate,
    tripType,
    fixedTransport,
    fuelEfficiencyKmPerL,
    gasolinePricePerL,
  });
  const highway = Number(highwayToll || 0);
  const parking = Number(parkingFee || 0);
  const travelCostTotal = transportCost + highway + parking;
  const sqm = Number(area || 0);
  const sales = effectiveSellingUnitPrice * sqm - discountAmount;
  const cost = costUnitPrice * sqm + outsourcingCost + travelCostTotal;
  const profit = sales - cost;
  const rate = sales > 0 ? (profit / sales) * 100 : 0;

  return {
    sales,
    cost,
    profit,
    rate,
    inputSellingUnitPrice,
    sellingUnitPrice: inputSellingUnitPrice,
    effectiveSellingUnitPrice,
    usesRecommendedSellingUnitPrice,
    unitPrice: inputSellingUnitPrice,
    costUnitPrice,
    perSqmCost: costUnitPrice,
    pasteLabor: pasteLaborAmount,
    recommendedSellingUnitPrice,
    transportCost,
    highwayToll: highway,
    travelCostTotal,
    parkingFee: parking,
    outsourcingMode: outsourcingModeValue,
    laborCount: normalizeLaborCount(laborCount),
    laborUnitPrice: Number(laborUnitPrice || 0),
    outsourcingSqmUnitPrice: Number(outsourcingSqmUnitPrice || 0),
    labor: outsourcingCost,
    discount: discountAmount,
  };
}

export function getInvoiceTotals(estimate, standardLaborUnitPrice) {
  const line = getEstimateLine(estimate, standardLaborUnitPrice);
  const { sales: billingAmount } = resolveEstimateFinancials(
    estimate,
    standardLaborUnitPrice
  );
  const subtotal = Math.floor(billingAmount / 1.1);
  const tax = billingAmount - subtotal;
  return { ...line, subtotal, tax, billingAmount };
}

export function getMaterialForClient(clients, clientName, workType) {
  const c = clients.find((x) => x.name === clientName);
  if (!c) return 0;
  const field = WORK_TYPE_FIELD[workType];
  return field ? Number(c[field] || 0) : 0;
}

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

export function buildDashboard(estimates) {
  const now = new Date();
  let todayProfit = 0;
  let monthProfit = 0;
  let monthSales = 0;
  const clientSales = {};
  const workTypeSales = Object.fromEntries(WORK_TYPES.map((name) => [name, 0]));

  estimates.forEach((e) => {
    const date = parseEstimateDate(e.createdAt);
    const { profit, sales } = resolveEstimateFinancials(e);

    if (date && isSameDay(date, now)) todayProfit += profit;
    if (date && isSameMonth(date, now)) {
      monthProfit += profit;
      monthSales += sales;
    }

    if (e.client) {
      clientSales[e.client] = (clientSales[e.client] || 0) + sales;
    }

    if (workTypeSales[e.workType] !== undefined) {
      workTypeSales[e.workType] += sales;
    }
  });

  const profitRate = monthSales > 0 ? (monthProfit / monthSales) * 100 : 0;
  const clientRanking = Object.entries(clientSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales);

  const workTypeBreakdown = WORK_TYPES.map((name) => ({
    name,
    sales: workTypeSales[name],
  }));

  return {
    todayProfit,
    monthProfit,
    monthSales,
    profitRate,
    estimateCount: estimates.length,
    clientRanking,
    workTypeBreakdown,
  };
}

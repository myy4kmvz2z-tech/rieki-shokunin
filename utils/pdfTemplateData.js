import { DEFAULT_LABOR_UNIT_PRICE } from "../lib/constants";
import {
  formatCostDisplay,
  formatCostExtrasDisplay,
  formatOutsourcingDisplay,
  formatProfitRateJudgment,
  formatSalesDisplay,
  getEstimateDisplayTotals,
  getEstimateLine,
  getInvoiceTotals,
  getOutsourcingModeLabel,
  getProfitRateJudgment,
  getTargetProfitRate,
  yen,
} from "./calcProfit";

function getStandardLaborUnitPrice(company) {
  return Number(company?.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE);
}

function stripYen(value) {
  return String(value ?? "").replace(/^¥/, "");
}

export function buildEstimateTemplateData(estimate, company) {
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company);
  const { unitPrice, discount, lineAmount } = getEstimateLine(estimate, standardLaborUnitPrice);
  const display = getEstimateDisplayTotals(estimate, standardLaborUnitPrice);
  const estimateDate =
    estimate.createdAt?.split(" ")[0] || new Date().toLocaleDateString("ja-JP");
  const judgment = getProfitRateJudgment(display.rate);

  const tableRows = [
    [estimate.workType, `${estimate.area} ㎡`, yen(unitPrice), yen(lineAmount)],
  ];

  if (discount > 0) {
    tableRows.push(["値引き", "—", "—", `-${stripYen(yen(discount))}`]);
  }

  return {
    docType: "estimate",
    title: "見 積 書",
    metaLines: [`見積日：${estimateDate}`, `見積No.：${String(estimate.id).slice(-8)}`],
    companyLines: [
      company.name,
      company.address,
      `TEL ${company.tel}`,
      company.representative,
    ].filter(Boolean),
    clientLine: `${estimate.client} 御中`,
    siteLines: [
      `現場名：${estimate.siteName}`,
      estimate.siteAddress ? `現場住所：${estimate.siteAddress}` : null,
    ].filter(Boolean),
    intro: "下記の通りお見積り申し上げます。",
    tableHeaders: ["工事項目", "数量", "販売単価", "金額"],
    tableRows,
    summaryLines: [{ label: "合計（税込）", value: yen(display.sales), emphasis: true }],
    detailSections: [
      { title: "売上", body: formatSalesDisplay(display) },
      { title: "原価", body: formatCostDisplay(display) },
      {
        title: "外注費内訳",
        body: `外注費方式 ${getOutsourcingModeLabel(display.outsourcingMode)}\n${formatOutsourcingDisplay(display)}`,
      },
      { title: "原価内訳", body: formatCostExtrasDisplay(display) },
    ],
    keyValues: [
      { label: "利益", value: yen(display.profit) },
      { label: "利益率", value: formatProfitRateJudgment(display.rate) },
      { label: "目標利益率", value: `${getTargetProfitRate(estimate)}%` },
      { label: "判定", value: `${judgment.icon} ${judgment.label}` },
    ],
    notes: [
      "※ 本見積書の有効期限は発行日より30日間とさせていただきます。",
      "※ 工事内容の変更・追加が生じた場合は、別途お見積りいたします。",
    ],
  };
}

export function buildInvoiceTemplateData(estimate, company) {
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company);
  const { unitPrice, discount, lineAmount, subtotal, tax, billingAmount } = getInvoiceTotals(
    estimate,
    standardLaborUnitPrice
  );
  const display = getEstimateDisplayTotals(estimate, standardLaborUnitPrice);
  const issueDate = new Date().toLocaleDateString("ja-JP");

  const tableRows = [
    [estimate.workType, `${estimate.area} ㎡`, yen(unitPrice), yen(lineAmount)],
  ];

  if (discount > 0) {
    tableRows.push(["値引き", "—", "—", `-${stripYen(yen(discount))}`]);
  }

  const companyLines = [
    company.name,
    company.address,
    `TEL ${company.tel}`,
    company.representative,
    company.invoiceNumber ? `登録番号：${company.invoiceNumber}` : null,
  ].filter(Boolean);

  return {
    docType: "invoice",
    title: "請 求 書",
    metaLines: [`発行日：${issueDate}`, `請求No.：${String(estimate.id).slice(-8)}`],
    companyLines,
    clientLine: `${estimate.client} 御中`,
    siteLines: [
      `現場名：${estimate.siteName}`,
      estimate.siteAddress ? `現場住所：${estimate.siteAddress}` : null,
    ].filter(Boolean),
    intro: "下記の通りご請求申し上げます。",
    tableHeaders: ["工事項目", "数量", "販売単価", "金額"],
    tableRows,
    summaryLines: [
      { label: "小計", value: yen(subtotal) },
      { label: "消費税（10%）", value: yen(tax) },
      { label: "請求金額", value: yen(billingAmount), emphasis: true },
    ],
    detailSections: [
      {
        title: "外注費内訳（管理用）",
        body: `外注費方式 ${getOutsourcingModeLabel(display.outsourcingMode)}\n${formatOutsourcingDisplay(display)}`,
      },
      { title: "原価内訳", body: formatCostExtrasDisplay(display) },
      { title: "原価", body: formatCostDisplay(display) },
    ],
    keyValues: [
      { label: "利益", value: yen(display.profit) },
      { label: "利益率", value: formatProfitRateJudgment(display.rate) },
    ],
    notes: [
      "※ 原価内訳（外注費・交通費・駐車場代）は請求金額に含まれません。",
      "※ お振込手数料は貴社にてご負担ください。",
      "※ 本請求書の内容に相違がある場合は、7日以内にご連絡ください。",
    ],
  };
}

export function buildPdfTemplateData(type, estimate, company) {
  return type === "invoice"
    ? buildInvoiceTemplateData(estimate, company)
    : buildEstimateTemplateData(estimate, company);
}

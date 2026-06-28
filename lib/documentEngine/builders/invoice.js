import { DEFAULT_LABOR_UNIT_PRICE } from "../../constants";
import { buildPartnerDocumentExtras } from "../../partner";
import {
  formatCostDisplay,
  formatCostExtrasDisplay,
  formatOutsourcingDisplay,
  formatProfitRateJudgment,
  getEstimateDisplayTotals,
  getInvoiceTotals,
  getOutsourcingModeLabel,
  yen,
} from "../../../utils/calcProfit";

function getStandardLaborUnitPrice(company) {
  return Number(company?.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE);
}

function stripYen(value) {
  return String(value ?? "").replace(/^¥/, "");
}

export function buildInvoiceDocument({ estimate, company }) {
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company);
  const { unitPrice, discount, lineAmount, subtotal, tax, billingAmount } = getInvoiceTotals(
    estimate,
    standardLaborUnitPrice
  );
  const display = getEstimateDisplayTotals(estimate, standardLaborUnitPrice);
  const issueDate = new Date().toLocaleDateString("ja-JP");
  const customerExtras = buildPartnerDocumentExtras(estimate);

  const tableRows = [
    [estimate.workType, `${estimate.area} ㎡`, yen(unitPrice), yen(lineAmount)],
  ];

  if (discount > 0) {
    tableRows.push(["値引き", "—", "—", `-${stripYen(yen(discount))}`]);
  }

  return {
    title: "請 求 書",
    metaLines: [`発行日：${issueDate}`, `請求No.：${String(estimate.id).slice(-8)}`],
    companyLines: [
      company.name,
      company.address,
      `TEL ${company.tel}`,
      company.representative,
      company.invoiceNumber ? `登録番号：${company.invoiceNumber}` : null,
    ].filter(Boolean),
    clientLine: customerExtras.clientLine ?? `${estimate.client} 御中`,
    siteLines: [
      `現場名：${estimate.siteName}`,
      estimate.siteAddress ? `現場住所：${estimate.siteAddress}` : null,
      ...customerExtras.recipientLines,
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
      ...customerExtras.paymentKeyValues,
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

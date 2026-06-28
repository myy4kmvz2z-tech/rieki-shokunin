import { DEFAULT_LABOR_UNIT_PRICE } from "../../constants";
import { buildPartnerDocumentExtras } from "../../partner";
import {
  formatCostDisplay,
  formatCostExtrasDisplay,
  formatOutsourcingDisplay,
  formatProfitRateJudgment,
  formatSalesDisplay,
  getEstimateDisplayTotals,
  getEstimateLine,
  getOutsourcingModeLabel,
  getProfitRateJudgment,
  getTargetProfitRate,
  yen,
} from "../../../utils/calcProfit";

function getStandardLaborUnitPrice(company) {
  return Number(company?.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE);
}

function stripYen(value) {
  return String(value ?? "").replace(/^¥/, "");
}

export function buildEstimateDocument({ estimate, company }) {
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company);
  const { unitPrice, discount, lineAmount } = getEstimateLine(estimate, standardLaborUnitPrice);
  const display = getEstimateDisplayTotals(estimate, standardLaborUnitPrice);
  const estimateDate =
    estimate.createdAt?.split(" ")[0] || new Date().toLocaleDateString("ja-JP");
  const judgment = getProfitRateJudgment(display.rate);
  const customerExtras = buildPartnerDocumentExtras(estimate);

  const tableRows = [
    [estimate.workType, `${estimate.area} ㎡`, yen(unitPrice), yen(lineAmount)],
  ];

  if (discount > 0) {
    tableRows.push(["値引き", "—", "—", `-${stripYen(yen(discount))}`]);
  }

  return {
    title: "見 積 書",
    metaLines: [`見積日：${estimateDate}`, `見積No.：${String(estimate.id).slice(-8)}`],
    companyLines: [
      company.name,
      company.address,
      `TEL ${company.tel}`,
      company.representative,
    ].filter(Boolean),
    clientLine: customerExtras.clientLine ?? `${estimate.client} 御中`,
    siteLines: [
      `現場名：${estimate.siteName}`,
      estimate.siteAddress ? `現場住所：${estimate.siteAddress}` : null,
      ...customerExtras.recipientLines,
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

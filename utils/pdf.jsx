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
import { DEFAULT_LABOR_UNIT_PRICE } from "../lib/constants";
import { buildPartnerDocumentExtras } from "../lib/partner";

function getStandardLaborUnitPrice(company) {
  return Number(company?.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE);
}

export function InvoicePaper({ estimate, company }) {
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company);
  const { unitPrice, discount, lineAmount, subtotal, tax, billingAmount } =
    getInvoiceTotals(estimate, standardLaborUnitPrice);
  const display = getEstimateDisplayTotals(estimate, standardLaborUnitPrice);
  const issueDate = new Date().toLocaleDateString("ja-JP");
  const customerExtras = buildPartnerDocumentExtras(estimate);

  return (
    <>
      <div className="paper-head">
        <h1>請 求 書</h1>
        <div className="paper-meta">
          <div>発行日：{issueDate}</div>
          <div>請求No.：{String(estimate.id).slice(-8)}</div>
        </div>
      </div>

      <div className="paper-company">
        <strong>{company.name}</strong>
        {company.address}
        <br />
        TEL {company.tel}
        <br />
        {company.representative}
        {company.invoiceNumber && (
          <>
            <br />
            登録番号：{company.invoiceNumber}
          </>
        )}
      </div>

      <div className="paper-to">
        <strong>{customerExtras.clientLine ?? `${estimate.client} 御中`}</strong>
        <p className="paper-site">現場名：{estimate.siteName}</p>
        {estimate.siteAddress && (
          <p className="paper-site">現場住所：{estimate.siteAddress}</p>
        )}
        {customerExtras.recipientLines.map((line) => (
          <p key={line} className="paper-site">
            {line}
          </p>
        ))}
      </div>

      <p>下記の通りご請求申し上げます。</p>

      <table className="paper-items">
        <thead>
          <tr>
            <th>工事項目</th>
            <th>数量</th>
            <th>販売単価</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{estimate.workType}</td>
            <td>{estimate.area} ㎡</td>
            <td>{yen(unitPrice)}</td>
            <td>{yen(lineAmount)}</td>
          </tr>
          {discount > 0 && (
            <tr>
              <td>値引き</td>
              <td>—</td>
              <td>—</td>
              <td>-{yen(discount).replace("¥", "")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="paper-summary">
        <div>
          <span>小計</span>
          <span>{yen(subtotal)}</span>
        </div>
        <div>
          <span>消費税（10%）</span>
          <span>{yen(tax)}</span>
        </div>
        <div>
          <span>請求金額</span>
          <span>{yen(billingAmount)}</span>
        </div>
      </div>

      {customerExtras.paymentKeyValues.length > 0 && (
        <div className="paper-profit">
          {customerExtras.paymentKeyValues.map(({ label, value }) => (
            <div key={label}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="paper-profit">
        <div className="paper-breakdown">
          <strong>外注費内訳（管理用）</strong>
          <div>
            外注費方式 {getOutsourcingModeLabel(display.outsourcingMode)}
          </div>
          <div>{formatOutsourcingDisplay(display)}</div>
        </div>
        <div className="paper-breakdown">
          <strong>原価内訳</strong>
          <div>{formatCostExtrasDisplay(display)}</div>
        </div>
        <div className="paper-breakdown">
          <strong>原価</strong>
          <div>{formatCostDisplay(display)}</div>
        </div>
        <div>
          <span>利益</span>
          <span>{yen(display.profit)}</span>
        </div>
        <div>
          <span>利益率</span>
          <span>{formatProfitRateJudgment(display.rate)}</span>
        </div>
      </div>

      <p className="paper-note">※ 原価内訳（外注費・交通費・駐車場代）は請求金額に含まれません。</p>

      <p className="paper-note">
        ※ お振込手数料は貴社にてご負担ください。
        <br />
        ※ 本請求書の内容に相違がある場合は、7日以内にご連絡ください。
      </p>
    </>
  );
}

export function EstimatePaper({ estimate, company }) {
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company);
  const { unitPrice, discount, lineAmount } = getEstimateLine(
    estimate,
    standardLaborUnitPrice
  );
  const display = getEstimateDisplayTotals(estimate, standardLaborUnitPrice);
  const estimateDate = estimate.createdAt?.split(" ")[0] || new Date().toLocaleDateString("ja-JP");
  const customerExtras = buildPartnerDocumentExtras(estimate);

  return (
    <>
      <div className="paper-head">
        <h1>見 積 書</h1>
        <div className="paper-meta">
          <div>見積日：{estimateDate}</div>
          <div>見積No.：{String(estimate.id).slice(-8)}</div>
        </div>
      </div>

      <div className="paper-company">
        <strong>{company.name}</strong>
        {company.address}
        <br />
        TEL {company.tel}
        <br />
        {company.representative}
      </div>

      <div className="paper-to">
        <strong>{customerExtras.clientLine ?? `${estimate.client} 御中`}</strong>
        <p className="paper-site">現場名：{estimate.siteName}</p>
        {estimate.siteAddress && (
          <p className="paper-site">現場住所：{estimate.siteAddress}</p>
        )}
        {customerExtras.recipientLines.map((line) => (
          <p key={line} className="paper-site">
            {line}
          </p>
        ))}
      </div>

      <p>下記の通りお見積り申し上げます。</p>

      <table className="paper-items">
        <thead>
          <tr>
            <th>工事項目</th>
            <th>数量</th>
            <th>販売単価</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{estimate.workType}</td>
            <td>{estimate.area} ㎡</td>
            <td>{yen(unitPrice)}</td>
            <td>{yen(lineAmount)}</td>
          </tr>
          {discount > 0 && (
            <tr>
              <td>値引き</td>
              <td>—</td>
              <td>—</td>
              <td>-{yen(discount).replace("¥", "")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="paper-total">
        <span>合計（税込）</span>
        <strong>{yen(display.sales)}</strong>
      </div>

      <div className="paper-profit">
        <div className="paper-breakdown">
          <strong>売上</strong>
          <div>{formatSalesDisplay(display)}</div>
        </div>
        <div className="paper-breakdown">
          <strong>原価</strong>
          <div>{formatCostDisplay(display)}</div>
        </div>
        <div className="paper-breakdown">
          <strong>外注費内訳</strong>
          <div>
            外注費方式 {getOutsourcingModeLabel(display.outsourcingMode)}
          </div>
          <div>{formatOutsourcingDisplay(display)}</div>
        </div>
        <div className="paper-breakdown">
          <strong>原価内訳</strong>
          <div>{formatCostExtrasDisplay(display)}</div>
        </div>
        <div>
          <span>利益</span>
          <span>{yen(display.profit)}</span>
        </div>
        <div>
          <span>利益率</span>
          <span>{formatProfitRateJudgment(display.rate)}</span>
        </div>
        <div>
          <span>目標利益率</span>
          <span>{getTargetProfitRate(estimate)}%</span>
        </div>
        <div>
          <span>判定</span>
          <span>{getProfitRateJudgment(display.rate).icon} {getProfitRateJudgment(display.rate).label}</span>
        </div>
      </div>

      <p className="paper-note">
        ※ 本見積書の有効期限は発行日より30日間とさせていただきます。
        <br />
        ※ 工事内容の変更・追加が生じた場合は、別途お見積りいたします。
      </p>
    </>
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTable(data) {
  const head = data.tableHeaders.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("");
  const body = data.tableRows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`
    )
    .join("");

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderSummary(data) {
  return data.summaryLines
    .map(
      (line) =>
        `<div class="summary-row${line.emphasis ? " emphasis" : ""}"><span>${escapeHtml(line.label)}</span><span>${escapeHtml(line.value)}</span></div>`
    )
    .join("");
}

function renderDocumentHtml(data) {
  const company = data.companyLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("");
  const sites = data.siteLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  const meta = data.metaLines.map((line) => `<div>${escapeHtml(line)}</div>`).join("");
  const details = data.detailSections
    .map(
      (section) =>
        `<section><strong>${escapeHtml(section.title)}</strong><div>${escapeHtml(section.body).replace(/\n/g, "<br />")}</div></section>`
    )
    .join("");
  const keyValues = data.keyValues
    .map(
      (item) =>
        `<div class="kv"><span>${escapeHtml(item.label)}</span><span>${escapeHtml(item.value)}</span></div>`
    )
    .join("");
  const notes = data.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(data.title)}</title>
  <style>
    body { font-family: "Hiragino Mincho ProN", "Yu Mincho", serif; color: #111; margin: 0; padding: 24px; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h1 { margin: 0; font-size: 28px; letter-spacing: 0.2em; }
    .meta { text-align: right; font-size: 12px; line-height: 1.7; }
    .company { font-size: 13px; line-height: 1.7; margin-bottom: 20px; }
    .to { margin: 24px 0; }
    .to strong { display: block; font-size: 18px; border-bottom: 1px solid #222; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #333; padding: 8px 10px; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #f1f1f1; }
    .summary { margin-top: 20px; max-width: 320px; margin-left: auto; }
    .summary-row { display: flex; justify-content: space-between; gap: 16px; padding: 6px 0; border-bottom: 1px solid #ccc; }
    .summary-row.emphasis { border-bottom: 2px solid #111; font-weight: 700; font-size: 16px; }
    .details { margin-top: 16px; padding: 12px 14px; background: #f8f8f8; border: 1px solid #333; font-size: 13px; }
    .details section { margin-bottom: 10px; }
    .kv { display: flex; justify-content: space-between; gap: 16px; margin-top: 6px; }
    .notes { margin-top: 28px; font-size: 11px; color: #444; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="head">
    <h1>${escapeHtml(data.title)}</h1>
    <div class="meta">${meta}</div>
  </div>
  <div class="company">${company}</div>
  <div class="to">
    <strong>${escapeHtml(data.clientLine)}</strong>
    ${sites}
  </div>
  <p>${escapeHtml(data.intro)}</p>
  ${renderTable(data)}
  <div class="summary">${renderSummary(data)}</div>
  <div class="details">${details}${keyValues}</div>
  <div class="notes">${notes}</div>
</body>
</html>`;
}

export function renderEstimateHtml(data) {
  return renderDocumentHtml(data);
}

export function renderInvoiceHtml(data) {
  return renderDocumentHtml(data);
}

export function renderPdfTemplateHtml(type, data) {
  return type === "invoice" ? renderInvoiceHtml(data) : renderEstimateHtml(data);
}

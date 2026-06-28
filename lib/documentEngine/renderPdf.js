import { createPdfDocument } from "./font";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function drawParagraph(doc, text, x, y, size, maxWidth, lineHeight) {
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(String(text ?? ""), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function drawLines(doc, lines, x, y, size, lineHeight) {
  doc.setFontSize(size);
  lines.forEach((line) => {
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

function drawTable(doc, viewModel, x, y) {
  const colWidths = [
    CONTENT_WIDTH * 0.4,
    CONTENT_WIDTH * 0.15,
    CONTENT_WIDTH * 0.2,
    CONTENT_WIDTH * 0.25,
  ];
  const rowHeight = 8;
  let cursorY = y;

  const drawRow = (cells, header = false) => {
    let cellX = x;
    cells.forEach((cell, index) => {
      doc.setDrawColor(60, 60, 60);
      doc.rect(cellX, cursorY, colWidths[index], rowHeight);
      doc.setFontSize(header ? 10 : 9);
      doc.text(String(cell ?? ""), cellX + 2, cursorY + 5.5);
      cellX += colWidths[index];
    });
    cursorY += rowHeight;
  };

  drawRow(viewModel.tableHeaders, true);
  viewModel.tableRows.forEach((row) => drawRow(row));
  return cursorY + 2;
}

function drawSummary(doc, summaryLines, y) {
  const boxWidth = 70;
  const boxX = PAGE_WIDTH - MARGIN - boxWidth;
  let cursorY = y;

  summaryLines.forEach((line) => {
    doc.setFontSize(line.emphasis ? 12 : 10);
    doc.text(line.label, boxX, cursorY);
    doc.text(line.value, boxX + boxWidth - 28, cursorY);
    cursorY += line.emphasis ? 8 : 6;
  });

  return cursorY;
}

function drawDetailsBox(doc, viewModel, y) {
  let cursorY = y;

  (viewModel.detailSections ?? []).forEach((section) => {
    doc.setFontSize(10);
    doc.text(section.title, MARGIN, cursorY);
    cursorY += 5;
    cursorY = drawParagraph(doc, section.body, MARGIN, cursorY, 9, CONTENT_WIDTH - 4, 4.5);
    cursorY += 2;
  });

  (viewModel.keyValues ?? []).forEach((item) => {
    doc.setFontSize(9);
    doc.text(item.label, MARGIN, cursorY);
    doc.text(item.value, PAGE_WIDTH - MARGIN - 40, cursorY);
    cursorY += 5;
  });

  return cursorY;
}

/** 共通A4レイアウトからPDFを描画 */
export async function renderDocumentPdf(viewModel) {
  const doc = await createPdfDocument();
  let y = MARGIN + 4;

  doc.setFontSize(22);
  doc.text(viewModel.title, MARGIN, y);

  let metaY = MARGIN + 4;
  viewModel.metaLines.forEach((line) => {
    doc.setFontSize(10);
    doc.text(line, PAGE_WIDTH - MARGIN, metaY, { align: "right" });
    metaY += 5;
  });

  y += 12;
  y = drawLines(doc, viewModel.companyLines, MARGIN, y, 10, 5);
  y += 4;

  doc.setFontSize(14);
  doc.text(viewModel.clientLine, MARGIN, y);
  y += 6;
  y = drawLines(doc, viewModel.siteLines, MARGIN, y, 10, 5);
  y += 4;

  y = drawParagraph(doc, viewModel.intro, MARGIN, y, 10, CONTENT_WIDTH, 5);
  y += 2;
  y = drawTable(doc, viewModel, MARGIN, y);
  y = drawSummary(doc, viewModel.summaryLines, y + 2);
  y += 4;
  y = drawDetailsBox(doc, viewModel, y);

  (viewModel.notes ?? []).forEach((note) => {
    y = drawParagraph(doc, note, MARGIN, y, 8, CONTENT_WIDTH, 4);
    y += 2;
  });

  const blob = doc.output("blob");
  if (!blob || blob.size === 0) {
    throw new Error("PDFファイルの生成に失敗しました。");
  }

  return blob;
}

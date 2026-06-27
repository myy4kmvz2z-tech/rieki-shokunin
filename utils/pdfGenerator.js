import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { buildPdfTemplateData } from "./pdfTemplateData";
import { renderPdfTemplateHtml } from "./pdfTemplateHtml";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

let fontBytesPromise = null;

async function loadFontBytes() {
  if (!fontBytesPromise) {
    fontBytesPromise = fetch("/fonts/NotoSansJP-Regular.otf").then((response) => {
      if (!response.ok) {
        throw new Error("PDF用フォントの読み込みに失敗しました。");
      }
      return response.arrayBuffer();
    });
  }
  return fontBytesPromise;
}

function wrapText(text, font, size, maxWidth) {
  const input = String(text ?? "");
  if (!input) return [""];

  const lines = [];
  let current = "";

  for (const char of input) {
    const next = current + char;
    const width = font.widthOfTextAtSize(next, size);
    if (width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function drawLines(page, font, lines, x, y, size, lineHeight) {
  let cursorY = y;
  lines.forEach((line) => {
    page.drawText(line, {
      x,
      y: cursorY,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    cursorY -= lineHeight;
  });
  return cursorY;
}

function drawParagraph(page, font, text, x, y, size, maxWidth, lineHeight) {
  const lines = String(text ?? "")
    .split("\n")
    .flatMap((part) => wrapText(part, font, size, maxWidth));
  return drawLines(page, font, lines, x, y, size, lineHeight);
}

function drawTable(page, font, headers, rows, x, y) {
  const colWidths = [
    CONTENT_WIDTH * 0.4,
    CONTENT_WIDTH * 0.15,
    CONTENT_WIDTH * 0.2,
    CONTENT_WIDTH * 0.25,
  ];
  const rowHeight = 22;
  let cursorY = y;

  const drawRow = (cells, bold = false) => {
    let cellX = x;
    cells.forEach((cell, index) => {
      page.drawRectangle({
        x: cellX,
        y: cursorY - rowHeight + 4,
        width: colWidths[index],
        height: rowHeight,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 0.6,
      });
      page.drawText(String(cell ?? ""), {
        x: cellX + 6,
        y: cursorY - 14,
        size: bold ? 10 : 9,
        font,
        color: rgb(0, 0, 0),
      });
      cellX += colWidths[index];
    });
    cursorY -= rowHeight;
  };

  drawRow(headers, true);
  rows.forEach((row) => drawRow(row));
  return cursorY - 8;
}

function drawSummary(page, font, summaryLines, x, y) {
  const boxWidth = 220;
  const boxX = PAGE_WIDTH - MARGIN - boxWidth;
  let cursorY = y;

  summaryLines.forEach((line) => {
    page.drawText(line.label, {
      x: boxX,
      y: cursorY,
      size: line.emphasis ? 12 : 10,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(line.value, {
      x: boxX + boxWidth - 90,
      y: cursorY,
      size: line.emphasis ? 12 : 10,
      font,
      color: rgb(0, 0, 0),
    });
    cursorY -= line.emphasis ? 20 : 16;
  });

  return cursorY;
}

function drawDetailsBox(page, font, data, x, y) {
  let cursorY = y;

  data.detailSections.forEach((section) => {
    page.drawText(section.title, {
      x,
      y: cursorY,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    cursorY -= 14;
    cursorY = drawParagraph(page, font, section.body, x, cursorY, 9, CONTENT_WIDTH - 24, 12);
    cursorY -= 6;
  });

  data.keyValues.forEach((item) => {
    page.drawText(item.label, { x, y: cursorY, size: 9, font, color: rgb(0, 0, 0) });
    page.drawText(item.value, {
      x: PAGE_WIDTH - MARGIN - 120,
      y: cursorY,
      size: 9,
      font,
      color: rgb(0, 0, 0),
    });
    cursorY -= 14;
  });

  return cursorY;
}

function renderPdfPage(pdfDoc, font, data) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  page.drawText(data.title, {
    x: MARGIN,
    y: y - 4,
    size: 22,
    font,
    color: rgb(0, 0, 0),
  });

  let metaY = y;
  data.metaLines.forEach((line) => {
    const textWidth = font.widthOfTextAtSize(line, 10);
    page.drawText(line, {
      x: PAGE_WIDTH - MARGIN - textWidth,
      y: metaY,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    metaY -= 14;
  });

  y -= 34;
  y = drawLines(page, font, data.companyLines, MARGIN, y, 10, 14);
  y -= 10;

  page.drawText(data.clientLine, {
    x: MARGIN,
    y,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 18;
  y = drawLines(page, font, data.siteLines, MARGIN, y, 10, 14);
  y -= 8;

  y = drawParagraph(page, font, data.intro, MARGIN, y, 10, CONTENT_WIDTH, 14);
  y -= 6;
  y = drawTable(page, font, data.tableHeaders, data.tableRows, MARGIN, y);
  y = drawSummary(page, font, data.summaryLines, MARGIN, y - 4);
  y -= 12;
  y = drawDetailsBox(page, font, data, MARGIN, y);
  y -= 10;

  data.notes.forEach((note) => {
    y = drawParagraph(page, font, note, MARGIN, y, 8, CONTENT_WIDTH, 11);
    y -= 4;
  });
}

export async function generatePdfBlobFromTemplate(type, estimate, company) {
  const data = buildPdfTemplateData(type, estimate, company);
  const html = renderPdfTemplateHtml(type, data);
  const fontBytes = await loadFontBytes();
  const pdfDoc = await PDFDocument.create();

  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  renderPdfPage(pdfDoc, font, data);

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });

  if (!blob.size) {
    throw new Error("PDFファイルの生成に失敗しました。");
  }

  return { blob, html, data };
}

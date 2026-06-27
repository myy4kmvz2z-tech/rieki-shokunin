export function formatPdfDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function sanitizePdfSiteName(siteName) {
  const sanitized = String(siteName || "名称未設定")
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 40);

  return sanitized || "名称未設定";
}

export function buildPdfFilename(type, siteName, date = new Date()) {
  const prefix = type === "invoice" ? "請求書" : "見積書";
  return `${prefix}_${sanitizePdfSiteName(siteName)}_${formatPdfDate(date)}.pdf`;
}

function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

export async function elementToPdfBlob(element) {
  if (!element) {
    throw new Error("PDF生成対象が見つかりません。");
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf.output("blob");
}

export function canSharePdfFiles() {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  if (typeof navigator.canShare !== "function") {
    return false;
  }

  try {
    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export async function sharePdfFile(blob, filename) {
  const file = new File([blob], filename, { type: "application/pdf" });
  await navigator.share({
    files: [file],
    title: filename,
  });
}

export function downloadPdfFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function createPdfFromHost(hostElement, type, siteName) {
  const paper = hostElement?.querySelector(".paper");
  await waitForPaint();
  const blob = await elementToPdfBlob(paper);
  const filename = buildPdfFilename(type, siteName);
  return { blob, filename, type };
}

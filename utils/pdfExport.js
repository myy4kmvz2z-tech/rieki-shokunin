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

async function waitForRenderReady() {
  await waitForPaint();
  await waitForPaint();
  await new Promise((resolve) => setTimeout(resolve, 120));
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
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  if (!canvas.width || !canvas.height) {
    throw new Error("PDFの描画に失敗しました。");
  }

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const blob = pdf.output("blob");
  if (!blob || blob.size === 0) {
    throw new Error("PDFファイルの生成に失敗しました。");
  }

  return blob;
}

export function canSharePdfFiles() {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  if (typeof navigator.canShare !== "function") {
    return /iphone|ipad|ipod|android/i.test(navigator.userAgent || "");
  }

  try {
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "test.pdf", {
      type: "application/pdf",
    });
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export function createPdfFile(blob, filename) {
  return new File([blob], filename, { type: "application/pdf" });
}

export async function sharePdfFile(fileOrBlob, filename) {
  const file =
    fileOrBlob instanceof File ? fileOrBlob : createPdfFile(fileOrBlob, filename);
  const shareData = { files: [file], title: filename };

  if (typeof navigator.canShare === "function" && !navigator.canShare(shareData)) {
    throw new Error("SHARE_UNSUPPORTED");
  }

  await navigator.share(shareData);
}

export function downloadPdfFile(fileOrBlob, filename) {
  const url = URL.createObjectURL(fileOrBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function createPdfFromElement(element, type, siteName) {
  await waitForRenderReady();
  const blob = await elementToPdfBlob(element);
  const filename = buildPdfFilename(type, siteName);
  const file = createPdfFile(blob, filename);
  return { blob, file, filename, type };
}

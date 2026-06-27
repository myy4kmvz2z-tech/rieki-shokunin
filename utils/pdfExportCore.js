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

export function getAvailableSendMethods(canShare) {
  const all = [
    { id: "line", label: "LINE" },
    { id: "mail", label: "メール" },
    { id: "airdrop", label: "AirDrop" },
    { id: "pdf-save", label: "PDF保存" },
    { id: "print", label: "印刷" },
  ];

  if (canShare) return all;
  return all.filter((item) => item.id === "pdf-save");
}

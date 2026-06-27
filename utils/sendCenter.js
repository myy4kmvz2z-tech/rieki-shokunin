import {
  downloadPdfFile,
  sharePdfFile,
} from "./pdfExport";

export const SEND_METHODS = [
  { id: "line", label: "LINE" },
  { id: "mail", label: "メール" },
  { id: "airdrop", label: "AirDrop" },
  { id: "pdf-save", label: "PDF保存" },
  { id: "print", label: "印刷" },
];

export const SHARE_SEND_METHODS = new Set(["line", "mail", "airdrop"]);

export function getSendMethodLabel(methodId) {
  return SEND_METHODS.find((item) => item.id === methodId)?.label ?? methodId;
}

export async function executeSendMethod(method, pdfResult) {
  if (method === "pdf-save") {
    downloadPdfFile(pdfResult.file ?? pdfResult.blob, pdfResult.filename);
    return;
  }

  if (method === "print") {
    return "print";
  }

  if (SHARE_SEND_METHODS.has(method)) {
    await sharePdfFile(pdfResult.file ?? pdfResult.blob, pdfResult.filename);
    return;
  }

  throw new Error("送信方法が選択されていません。");
}

export function buildSendHistoryEntry({ estimate, docType, method, filename }) {
  return {
    estimateId: estimate.id,
    siteName: estimate.siteName,
    client: estimate.client,
    docType,
    method,
    methodLabel: getSendMethodLabel(method),
    filename,
    docLabel: docType === "invoice" ? "請求書" : "見積書",
  };
}

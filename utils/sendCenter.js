import { downloadPdfFile, sharePdfFile } from "./pdfExportCore";

export async function executeSendMethod(method, pdfResult) {
  if (method === "pdf-save") {
    downloadPdfFile(pdfResult.file ?? pdfResult.blob, pdfResult.filename);
    return;
  }

  if (method === "print") {
    return "print";
  }

  if (method === "share") {
    await sharePdfFile(pdfResult.file ?? pdfResult.blob, pdfResult.filename);
    return;
  }

  throw new Error("送信方法が選択されていません。");
}

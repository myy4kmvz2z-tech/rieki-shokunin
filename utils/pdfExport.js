import { generateDocument } from "../lib/documentEngine";

export {
  formatPdfDate,
  sanitizePdfSiteName,
  buildPdfFilename,
  canSharePdfFiles,
  createPdfFile,
  sharePdfFile,
  downloadPdfFile,
  getAvailableSendMethods,
} from "./pdfExportCore";

export { generateDocument } from "../lib/documentEngine";

export async function createPdfDocument({ estimate, type, company }) {
  const result = await generateDocument({ docType: type, estimate, company });
  const file = new File([result.blob], result.filename, { type: "application/pdf" });

  return {
    blob: result.blob,
    file,
    filename: result.filename,
    type: result.docType,
    html: result.html,
    viewModel: result.viewModel,
  };
}

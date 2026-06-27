import { generatePdfBlobFromTemplate } from "./pdfGenerator";
import { buildPdfFilename } from "./pdfExportCore";

export {
  formatPdfDate,
  sanitizePdfSiteName,
  buildPdfFilename,
  canSharePdfFiles,
  createPdfFile,
  sharePdfFile,
  downloadPdfFile,
} from "./pdfExportCore";

export async function createPdfDocument({ estimate, type, company }) {
  const { blob, html } = await generatePdfBlobFromTemplate(type, estimate, company);
  const filename = buildPdfFilename(type, estimate.siteName);
  const file = new File([blob], filename, { type: "application/pdf" });
  return { blob, file, filename, type, html };
}

import { formatPdfDate, sanitizePdfSiteName } from "../../utils/pdfExportCore";
import {
  buildDocumentViewModel,
  getDocumentDefinition,
  isDocumentImplemented,
  listDocumentDefinitions,
  listImplementedDocumentDefinitions,
} from "./registry";
import { renderDocumentHtml } from "./renderHtml";
import { renderDocumentPdf } from "./renderPdf";

export {
  DOCUMENT_ESTIMATE,
  DOCUMENT_INVOICE,
  DOCUMENT_PURCHASE_ORDER,
  DOCUMENT_WORK_REPORT,
  DOCUMENT_COMPLETION_REPORT,
  DOCUMENT_RECEIPT,
  DOCUMENT_COMPLETION_CONFIRMATION,
  DOCUMENT_CONTRACT,
  DOCUMENT_SCHEDULE,
  ALL_DOCUMENT_TYPE_IDS,
  IMPLEMENTED_DOCUMENT_TYPE_IDS,
  DOCUMENT_TYPE_IDS,
  DOCUMENT_CATEGORY_FINANCIAL,
  DOCUMENT_CATEGORY_REPORT,
  DOCUMENT_CATEGORY_LEGAL,
  DOCUMENT_CATEGORY_SCHEDULE,
} from "./constants";

export {
  DOCUMENT_LAYOUT_STANDARD,
  DOCUMENT_LAYOUT_PHOTOS,
  DOCUMENT_LAYOUT_CONTRACT,
  DOCUMENT_LAYOUT_SCHEDULE,
} from "./capabilities";

export {
  getDocumentDefinition,
  isDocumentImplemented,
  listDocumentDefinitions,
  listImplementedDocumentDefinitions,
  buildDocumentViewModel,
} from "./registry";

export function buildDocumentFilename(docType, siteName, date = new Date()) {
  const { filenamePrefix } = getDocumentDefinition(docType);
  return `${filenamePrefix}_${sanitizePdfSiteName(siteName)}_${formatPdfDate(date)}.pdf`;
}

/**
 * Document Engine エントリポイント
 *
 * 帳票種別 → builder（データ差し替え）→ 共通レイアウト → HTML / PDF
 * 帳票追加時は registry + builder の追加のみ。エンジン本体の変更は最小限。
 */
export async function generateDocument({ docType, estimate, company }) {
  if (!isDocumentImplemented(docType)) {
    const { label } = getDocumentDefinition(docType);
    throw new Error(`「${label}」は Document Engine に登録済みですが、まだ実装されていません。`);
  }

  const viewModel = buildDocumentViewModel(docType, { estimate, company });
  const html = renderDocumentHtml(viewModel);
  const blob = await renderDocumentPdf(viewModel);
  const filename = buildDocumentFilename(docType, estimate.siteName);

  return {
    docType,
    viewModel,
    html,
    blob,
    filename,
    type: docType,
  };
}

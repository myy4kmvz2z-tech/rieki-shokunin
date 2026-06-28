import {
  DOCUMENT_CATEGORY_FINANCIAL,
  DOCUMENT_CATEGORY_LEGAL,
  DOCUMENT_CATEGORY_REPORT,
  DOCUMENT_CATEGORY_SCHEDULE,
  DOCUMENT_COMPLETION_CONFIRMATION,
  DOCUMENT_COMPLETION_REPORT,
  DOCUMENT_CONTRACT,
  DOCUMENT_ESTIMATE,
  DOCUMENT_INVOICE,
  DOCUMENT_PURCHASE_ORDER,
  DOCUMENT_RECEIPT,
  DOCUMENT_SCHEDULE,
  DOCUMENT_WORK_REPORT,
} from "./constants";
import {
  CAPABILITY_COMPLETION_CONFIRMATION,
  CAPABILITY_COMPLETION_REPORT,
  CAPABILITY_CONTRACT,
  CAPABILITY_SCHEDULE,
  CAPABILITY_STANDARD,
  CAPABILITY_WORK_REPORT,
} from "./capabilities";
import { buildEstimateDocument } from "./builders/estimate";
import { buildInvoiceDocument } from "./builders/invoice";

/**
 * 帳票定義レジストリ
 *
 * 新帳票追加手順:
 * 1. constants.js に DOCUMENT_* を追加
 * 2. builders/xxx.js を作成（buildXxxDocument）
 * 3. このオブジェクトに 1 エントリ追加し implemented: true + buildDocument を設定
 * 4. IMPLEMENTED_DOCUMENT_TYPE_IDS に ID を追加
 *
 * renderHtml / renderPdf の変更は、capabilities.layout が標準と異なる場合のみ。
 */
const DOCUMENT_REGISTRY = {
  [DOCUMENT_ESTIMATE]: {
    id: DOCUMENT_ESTIMATE,
    label: "見積書",
    sendLabel: "見積を送る",
    menuTitle: "見積書を送る",
    filenamePrefix: "見積書",
    category: DOCUMENT_CATEGORY_FINANCIAL,
    capabilities: CAPABILITY_STANDARD,
    implemented: true,
    buildDocument: buildEstimateDocument,
  },
  [DOCUMENT_INVOICE]: {
    id: DOCUMENT_INVOICE,
    label: "請求書",
    sendLabel: "請求書を送る",
    menuTitle: "請求書を送る",
    filenamePrefix: "請求書",
    category: DOCUMENT_CATEGORY_FINANCIAL,
    capabilities: CAPABILITY_STANDARD,
    implemented: true,
    buildDocument: buildInvoiceDocument,
  },
  [DOCUMENT_PURCHASE_ORDER]: {
    id: DOCUMENT_PURCHASE_ORDER,
    label: "発注書",
    sendLabel: "発注書を送る",
    menuTitle: "発注書を送る",
    filenamePrefix: "発注書",
    category: DOCUMENT_CATEGORY_FINANCIAL,
    capabilities: CAPABILITY_STANDARD,
    implemented: false,
    buildDocument: null,
  },
  [DOCUMENT_WORK_REPORT]: {
    id: DOCUMENT_WORK_REPORT,
    label: "作業報告書",
    sendLabel: "作業報告書を送る",
    menuTitle: "作業報告書を送る",
    filenamePrefix: "作業報告書",
    category: DOCUMENT_CATEGORY_REPORT,
    capabilities: CAPABILITY_WORK_REPORT,
    implemented: false,
    buildDocument: null,
  },
  [DOCUMENT_COMPLETION_REPORT]: {
    id: DOCUMENT_COMPLETION_REPORT,
    label: "完了報告書",
    sendLabel: "完了報告書を送る",
    menuTitle: "完了報告書を送る",
    filenamePrefix: "完了報告書",
    category: DOCUMENT_CATEGORY_REPORT,
    capabilities: CAPABILITY_COMPLETION_REPORT,
    implemented: false,
    buildDocument: null,
  },
  [DOCUMENT_RECEIPT]: {
    id: DOCUMENT_RECEIPT,
    label: "領収書",
    sendLabel: "領収書を送る",
    menuTitle: "領収書を送る",
    filenamePrefix: "領収書",
    category: DOCUMENT_CATEGORY_FINANCIAL,
    capabilities: CAPABILITY_STANDARD,
    implemented: false,
    buildDocument: null,
  },
  [DOCUMENT_COMPLETION_CONFIRMATION]: {
    id: DOCUMENT_COMPLETION_CONFIRMATION,
    label: "工事完了確認書",
    sendLabel: "工事完了確認書を送る",
    menuTitle: "工事完了確認書を送る",
    filenamePrefix: "工事完了確認書",
    category: DOCUMENT_CATEGORY_LEGAL,
    capabilities: CAPABILITY_COMPLETION_CONFIRMATION,
    implemented: false,
    buildDocument: null,
  },
  [DOCUMENT_CONTRACT]: {
    id: DOCUMENT_CONTRACT,
    label: "契約書",
    sendLabel: "契約書を送る",
    menuTitle: "契約書を送る",
    filenamePrefix: "契約書",
    category: DOCUMENT_CATEGORY_LEGAL,
    capabilities: CAPABILITY_CONTRACT,
    implemented: false,
    buildDocument: null,
  },
  [DOCUMENT_SCHEDULE]: {
    id: DOCUMENT_SCHEDULE,
    label: "工程表",
    sendLabel: "工程表を送る",
    menuTitle: "工程表を送る",
    filenamePrefix: "工程表",
    category: DOCUMENT_CATEGORY_SCHEDULE,
    capabilities: CAPABILITY_SCHEDULE,
    implemented: false,
    buildDocument: null,
  },
};

export function getDocumentDefinition(docType) {
  const definition = DOCUMENT_REGISTRY[docType];
  if (!definition) {
    throw new Error(`未登録の帳票種別です: ${docType}`);
  }
  return definition;
}

export function isDocumentImplemented(docType) {
  const definition = getDocumentDefinition(docType);
  return Boolean(definition.implemented && definition.buildDocument);
}

export function listDocumentDefinitions(options = {}) {
  const { implementedOnly = false, category = null } = options;
  return Object.values(DOCUMENT_REGISTRY).filter((definition) => {
    if (implementedOnly && !definition.implemented) return false;
    if (category && definition.category !== category) return false;
    return true;
  });
}

export function listImplementedDocumentDefinitions(options = {}) {
  return listDocumentDefinitions({ ...options, implementedOnly: true });
}

export function buildDocumentViewModel(docType, context) {
  const definition = getDocumentDefinition(docType);

  if (!definition.implemented || !definition.buildDocument) {
    throw new Error(
      `「${definition.label}」は Document Engine に登録済みですが、まだ実装されていません。`
    );
  }

  return {
    docType,
    ...definition.buildDocument(context),
  };
}

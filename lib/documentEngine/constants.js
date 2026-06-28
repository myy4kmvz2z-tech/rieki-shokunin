/** 帳票種別 ID（Document Engine 全体で一意） */

export const DOCUMENT_ESTIMATE = "estimate";
export const DOCUMENT_INVOICE = "invoice";
export const DOCUMENT_PURCHASE_ORDER = "purchaseOrder";
export const DOCUMENT_WORK_REPORT = "workReport";
export const DOCUMENT_COMPLETION_REPORT = "completionReport";
export const DOCUMENT_RECEIPT = "receipt";
export const DOCUMENT_COMPLETION_CONFIRMATION = "completionConfirmation";
export const DOCUMENT_CONTRACT = "contract";
export const DOCUMENT_SCHEDULE = "schedule";

/** 帳票カテゴリ（UI グルーピング・権限制御向け） */
export const DOCUMENT_CATEGORY_FINANCIAL = "financial";
export const DOCUMENT_CATEGORY_REPORT = "report";
export const DOCUMENT_CATEGORY_LEGAL = "legal";
export const DOCUMENT_CATEGORY_SCHEDULE = "schedule";

/**
 * Document Engine に登録する全帳票（実装済み + 将来追加予定）
 * 新帳票はここに ID を足し、registry.js に定義を 1 件追加するだけ
 */
export const ALL_DOCUMENT_TYPE_IDS = [
  DOCUMENT_ESTIMATE,
  DOCUMENT_INVOICE,
  DOCUMENT_PURCHASE_ORDER,
  DOCUMENT_WORK_REPORT,
  DOCUMENT_COMPLETION_REPORT,
  DOCUMENT_RECEIPT,
  DOCUMENT_COMPLETION_CONFIRMATION,
  DOCUMENT_CONTRACT,
  DOCUMENT_SCHEDULE,
];

/** PDF 生成・送信 UI が利用可能な帳票（実装済みのみ） */
export const IMPLEMENTED_DOCUMENT_TYPE_IDS = [DOCUMENT_ESTIMATE, DOCUMENT_INVOICE];

/** @deprecated listImplementedDocumentDefinitions() を使用 */
export const DOCUMENT_TYPE_IDS = IMPLEMENTED_DOCUMENT_TYPE_IDS;

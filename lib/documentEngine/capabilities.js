/**
 * 帳票ごとの描画・データ要件（将来の renderer 拡張用）
 *
 * 共通エンジン（renderHtml / renderPdf）は標準 viewModel を描画。
 * 特殊レイアウトが必要な帳票は layout + capabilities で分岐し、
 * builder の差し替えだけで対応できるようにする。
 */
export const DOCUMENT_LAYOUT_STANDARD = "standard";
export const DOCUMENT_LAYOUT_PHOTOS = "photos";
export const DOCUMENT_LAYOUT_CONTRACT = "contract";
export const DOCUMENT_LAYOUT_SCHEDULE = "schedule";

/** 標準レイアウト（見積・請求・発注・領収など） */
export const CAPABILITY_STANDARD = {
  layout: DOCUMENT_LAYOUT_STANDARD,
  hasTable: true,
  hasSummary: true,
  hasPhotos: false,
  hasSignatures: false,
  multiPage: false,
};

/** 作業報告書 */
export const CAPABILITY_WORK_REPORT = {
  layout: DOCUMENT_LAYOUT_STANDARD,
  hasTable: false,
  hasSummary: false,
  hasPhotos: false,
  hasSignatures: false,
  multiPage: true,
};

/** 完了報告書（写真付き） */
export const CAPABILITY_COMPLETION_REPORT = {
  layout: DOCUMENT_LAYOUT_PHOTOS,
  hasTable: false,
  hasSummary: false,
  hasPhotos: true,
  hasSignatures: false,
  multiPage: true,
};

/** 工事完了確認書 */
export const CAPABILITY_COMPLETION_CONFIRMATION = {
  layout: DOCUMENT_LAYOUT_STANDARD,
  hasTable: false,
  hasSummary: false,
  hasPhotos: false,
  hasSignatures: true,
  multiPage: false,
};

/** 契約書 */
export const CAPABILITY_CONTRACT = {
  layout: DOCUMENT_LAYOUT_CONTRACT,
  hasTable: false,
  hasSummary: false,
  hasPhotos: false,
  hasSignatures: true,
  multiPage: true,
};

/** 工程表 */
export const CAPABILITY_SCHEDULE = {
  layout: DOCUMENT_LAYOUT_SCHEDULE,
  hasTable: false,
  hasSummary: false,
  hasPhotos: false,
  hasSignatures: false,
  multiPage: true,
};

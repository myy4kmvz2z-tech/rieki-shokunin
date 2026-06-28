/**
 * Document Engine 共通 viewModel スキーマ（設計ドキュメント）
 *
 * 各 builder はこの形を返す。帳票固有データは optional フィールドで拡張する。
 * renderHtml / renderPdf は capabilities.layout に応じて optional を描画する。
 *
 * @typedef {Object} DocumentViewModel
 * @property {string} title - 帳票タイトル（例: 見積書）
 * @property {string} clientLine - 宛先（例: ○○株式会社 御中）
 * @property {string[]} companyLines - 自社情報行
 * @property {string[]} siteLines - 現場名・工事内容など
 * @property {string[]} metaLines - 右上メタ（日付・番号など）
 * @property {string} intro - 前文
 * @property {string[]} tableHeaders
 * @property {string[][]} tableRows
 * @property {{ label: string, value: string, emphasis?: boolean }[]} summaryLines
 * @property {{ title: string, body: string }[]} [detailSections]
 * @property {{ label: string, value: string }[]} [keyValues]
 * @property {string[]} [notes]
 *
 * --- 将来拡張（builder のみ追加、エンジン本体は layout 分岐で対応） ---
 *
 * @typedef {{ src: string, caption?: string }} DocumentPhoto
 * @property {{ title: string, photos: DocumentPhoto[] }[]} [photoSections] - 完了報告書
 * @property {{ label: string, name?: string, date?: string }[]} [signatureBlocks] - 確認書・契約書
 * @property {{ title: string, clauses: string[] }[]} [contractSections] - 契約書
 * @property {{ phase: string, start: string, end: string, note?: string }[]} [scheduleRows] - 工程表
 */

export {};

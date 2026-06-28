/**
 * Version 1.1 設計: 取引先評価
 *
 * 実装は Version 1.1 で行う。Version 1.0 では UI・集計ロジックを公開しない。
 *
 * ## 表示項目（取引先管理）
 * - 年間売上
 * - 年間利益
 * - 平均利益率
 * - 見積件数
 * - 請求件数
 * - 入金件数
 * - 未入金件数
 * - ★★★★★（5段階）
 *
 * ## ホーム画面
 * - 「おすすめ取引先 TOP3」
 *
 * ## データソース
 * - localStorage: rieki-estimates（estimate.client で取引先紐付け）
 * - localStorage: rieki-partners
 * - 集計対象年: 当年（estimate.createdAt）
 *
 * ## 件数定義
 * - 見積件数: paymentStatus = estimate | sent
 * - 請求件数: paymentStatus = invoiced | pending | paid
 * - 入金件数: paymentStatus = paid
 * - 未入金件数: paymentStatus = invoiced | pending
 *
 * ## 星評価（自動計算）
 * 3要素を 0–100 点化し加重平均 → 1–5 星
 * - 利益率（40%）… 平均利益率、30%以上で満点
 * - 支払いの早さ（35%）… 請求済みのうち入金済み比率
 * - 年間売上（25%）… 全取引先中の相対順位
 *
 * ## TOP3 並び順
 * 1. 星評価（降順）
 * 2. 年間利益（降順）
 * 3. 年間売上（降順）
 * 対象: 当年に実績がある取引先のみ
 *
 * ## Version 1.1 実装時の追加ファイル（予定）
 * - utils/partnerEvaluation.js … 集計・スコア計算
 * - components/PartnerEvaluationPanel.jsx … 取引先管理内の評価 UI
 * - Dashboard … おすすめ取引先 TOP3 セクション
 */

export const PARTNER_EVALUATION_PLANNED_VERSION = "1.1";

/**
 * 見積コピー用テンプレートを作成する。
 * 現場名・現場住所・ID・作成日・入金ステータスは引き継がない。
 */
export function prepareEstimateCopy(source) {
  if (!source) return null;

  const { id, siteName, siteAddress, createdAt, paymentStatus, ...rest } = source;

  return {
    ...rest,
    siteName: "",
    siteAddress: "",
  };
}

/**
 * テンプレートから見積作成画面用の初期値を生成する。
 * 現場名・住所・施工面積・交通費・駐車場代は含めない。
 */
export function templateToEstimateInitial(template) {
  if (!template) return null;

  return {
    client: template.client,
    workType: template.workType,
    material: template.material,
    pasteLabor: template.pasteLabor,
    substrate: template.substrate,
    auxiliary: template.auxiliary,
    waste: template.waste,
    outsourcingMode: template.outsourcingMode,
    laborUnitPrice: template.laborUnitPrice,
    outsourcingSqmUnitPrice: template.outsourcingSqmUnitPrice,
    targetProfitRate: template.targetProfitRate,
    siteName: "",
    siteAddress: "",
    transportFeeMethod: "manual",
    transportMode: "fixed",
    fixedTransport: 0,
    highwayToll: 0,
    parkingFee: 0,
    distanceKm: 0,
  };
}

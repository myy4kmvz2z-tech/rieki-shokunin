import { WORK_TYPES } from "../lib/constants";

export const QUICK_ESTIMATE_LIMIT = 10;

export const QUICK_WORK_TYPE_LABELS = {
  "クロス SP": "クロスSP",
  "クロス AA": "クロスAA",
  CF: "CF",
  "フロアタイル": "フロア",
  シート: "シート",
};

export function getQuickWorkTypeLabel(workType) {
  return QUICK_WORK_TYPE_LABELS[workType] || workType;
}

export function getQuickEstimateKey(client, workType) {
  return `${client}::${workType}`;
}

export function siteMasterToQuickEstimateInitial(master) {
  if (!master) return null;

  return {
    client: master.client,
    workType: master.workType,
    material: master.material,
    pasteLabor: master.pasteLabor,
    substrate: master.substrate,
    auxiliary: master.auxiliary,
    waste: master.waste,
    outsourcingMode: master.outsourcingMode,
    laborUnitPrice: master.laborUnitPrice,
    outsourcingSqmUnitPrice: master.outsourcingSqmUnitPrice,
    targetProfitRate: master.targetProfitRate,
    siteName: "",
    siteAddress: "",
    area: 0,
    laborCount: 0,
    transportFeeMethod: "manual",
    transportMode: "fixed",
    fixedTransport: 0,
    highwayToll: 0,
    parkingFee: 0,
    distanceKm: 0,
  };
}

export function buildQuickEstimateSections(siteMasters, usage = {}, limit = QUICK_ESTIMATE_LIMIT) {
  const ranked = [...siteMasters]
    .map((master) => ({
      ...master,
      usageCount: Number(usage[getQuickEstimateKey(master.client, master.workType)] || 0),
    }))
    .sort((a, b) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      const clientCompare = a.client.localeCompare(b.client, "ja");
      if (clientCompare !== 0) return clientCompare;
      return WORK_TYPES.indexOf(a.workType) - WORK_TYPES.indexOf(b.workType);
    })
    .slice(0, limit);

  const groups = new Map();
  ranked.forEach((master) => {
    if (!groups.has(master.client)) {
      groups.set(master.client, []);
    }
    groups.get(master.client).push(master);
  });

  return Array.from(groups.entries()).map(([client, items]) => ({
    client,
    items,
  }));
}

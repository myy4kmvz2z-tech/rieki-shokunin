import {
  DEFAULT_LABOR_UNIT_PRICE,
  DEFAULT_OUTSOURCING_MODE,
  DEFAULT_TARGET_PROFIT_RATE,
  WORK_TYPES,
} from "./constants";

export function findSiteMaster(siteMasters, client, workType) {
  return (
    siteMasters.find((item) => item.client === client && item.workType === workType) ?? null
  );
}

export function emptySiteMasterForm(clients = []) {
  return {
    client: clients[0]?.name || "",
    workType: WORK_TYPES[0],
    material: 0,
    pasteLabor: 0,
    substrate: 0,
    auxiliary: 0,
    waste: 0,
    outsourcingMode: DEFAULT_OUTSOURCING_MODE,
    laborUnitPrice: DEFAULT_LABOR_UNIT_PRICE,
    outsourcingSqmUnitPrice: 0,
    targetProfitRate: DEFAULT_TARGET_PROFIT_RATE,
  };
}

export function normalizeSiteMaster(raw) {
  return {
    id: raw.id ?? Date.now(),
    client: String(raw.client || ""),
    workType: WORK_TYPES.includes(raw.workType) ? raw.workType : WORK_TYPES[0],
    material: Number(raw.material || 0),
    pasteLabor: Number(raw.pasteLabor || 0),
    substrate: Number(raw.substrate || 0),
    auxiliary: Number(raw.auxiliary || 0),
    waste: Number(raw.waste || 0),
    outsourcingMode: raw.outsourcingMode === "sqm" ? "sqm" : "labor",
    laborUnitPrice: Number(raw.laborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE),
    outsourcingSqmUnitPrice: Number(raw.outsourcingSqmUnitPrice || 0),
    targetProfitRate: Number(raw.targetProfitRate ?? DEFAULT_TARGET_PROFIT_RATE),
  };
}

export function siteMasterToSyncFields(master) {
  return {
    material: master.material,
    pasteLabor: master.pasteLabor,
    substrate: master.substrate,
    auxiliary: master.auxiliary,
    waste: master.waste,
    outsourcingMode: master.outsourcingMode,
    laborUnitPrice: master.laborUnitPrice,
    outsourcingSqmUnitPrice: master.outsourcingSqmUnitPrice,
    targetProfitRate: master.targetProfitRate,
  };
}

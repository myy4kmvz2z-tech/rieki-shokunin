import {
  DEFAULT_LABOR_UNIT_PRICE,
  DEFAULT_OUTSOURCING_MODE,
  DEFAULT_TARGET_PROFIT_RATE,
  WORK_TYPES,
  WORK_TYPE_FIELD,
} from "./constants";

export function emptyTemplateForm(clients = []) {
  const defaultClient = clients[0]?.name || "";
  const client = clients.find((c) => c.name === defaultClient);
  const workType = WORK_TYPES[0];
  const field = WORK_TYPE_FIELD[workType];

  return {
    name: "",
    client: defaultClient,
    workType,
    material: client && field ? Number(client[field] || 0) : 0,
    pasteLabor: Number(client?.pasteLabor ?? 0),
    substrate: Number(client?.substrate ?? 0),
    auxiliary: Number(client?.auxiliary ?? 0),
    waste: Number(client?.waste ?? 0),
    outsourcingMode: client?.standardOutsourcingMode === "sqm" ? "sqm" : DEFAULT_OUTSOURCING_MODE,
    laborUnitPrice: Number(client?.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE),
    outsourcingSqmUnitPrice: Number(client?.standardOutsourcingSqmUnitPrice ?? 0),
    targetProfitRate: Number(client?.standardTargetProfitRate ?? DEFAULT_TARGET_PROFIT_RATE),
  };
}

export function normalizeTemplate(raw) {
  return {
    id: raw.id ?? Date.now(),
    name: String(raw.name || "").trim() || "名称未設定",
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

export function getTemplateMaterialFromClient(clients, clientName, workType) {
  const client = clients.find((c) => c.name === clientName);
  if (!client) return 0;
  const field = WORK_TYPE_FIELD[workType];
  return field ? Number(client[field] || 0) : 0;
}

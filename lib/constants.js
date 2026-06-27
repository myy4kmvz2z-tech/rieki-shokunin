export const WORK_TYPES = ["クロス SP", "クロス AA", "CF", "フロアタイル", "シート"];

export const WORK_TYPE_FIELD = {
  "クロス SP": "sp",
  "クロス AA": "aa",
  CF: "cf",
  フロアタイル: "floor",
  シート: "sheet",
};

export const PRICE_FIELDS = [
  { key: "sp", label: "SP 円/㎡" },
  { key: "aa", label: "AA 円/㎡" },
  { key: "cf", label: "CF 円/㎡" },
  { key: "floor", label: "フロア 円/㎡" },
  { key: "sheet", label: "シート 円/㎡" },
];

export const COST_UNIT_FIELDS = [
  { key: "pasteLabor", label: "貼り手間 円/㎡" },
  { key: "substrate", label: "下地処理費用 円/㎡" },
  { key: "auxiliary", label: "副資材 円/㎡" },
  { key: "waste", label: "廃材処分費用 円/㎡" },
];

export const OUTSOURCING_SETTING_FIELDS = [
  { key: "standardLaborUnitPrice", label: "標準常用単価 円/人工" },
  { key: "standardOutsourcingSqmUnitPrice", label: "標準外注請負単価 円/㎡" },
];

export const PROFIT_SETTING_FIELDS = [
  { key: "standardTargetProfitRate", label: "標準目標利益率 %" },
];

/** @deprecated use COST_UNIT_FIELDS */
export const COST_FIELDS = [...COST_UNIT_FIELDS, { key: "transport", label: "交通費 円" }];

export const DEFAULT_LABOR_UNIT_PRICE = 23000;
export const DEFAULT_TARGET_PROFIT_RATE = 20;

export const DEFAULT_CLIENT_SETTINGS = {
  pasteLabor: 0,
  substrate: 0,
  auxiliary: 0,
  waste: 0,
  transport: 0,
  standardLaborUnitPrice: DEFAULT_LABOR_UNIT_PRICE,
  standardOutsourcingSqmUnitPrice: 0,
  standardTargetProfitRate: DEFAULT_TARGET_PROFIT_RATE,
};

export const OUTSOURCING_MODES = [
  { value: "labor", label: "常用単価（1人工）" },
  { value: "sqm", label: "請負単価（㎡単価）" },
];

export const DEFAULT_CLIENTS = [
  {
    id: 1,
    name: "BRANCHONE",
    sp: 230,
    aa: 415,
    cf: 150,
    floor: 650,
    sheet: 800,
    ...DEFAULT_CLIENT_SETTINGS,
  },
  {
    id: 2,
    name: "ブルリノベ",
    sp: 230,
    aa: 415,
    cf: 150,
    floor: 650,
    sheet: 800,
    ...DEFAULT_CLIENT_SETTINGS,
  },
];

export const DEFAULT_COMPANY = {
  name: "有限会社 利益内装",
  address: "〒000-0000 東京都○○区○○ 1-2-3",
  tel: "03-0000-0000",
  representative: "代表取締役 山田 太郎",
  invoiceNumber: "T0000000000000",
  standardLaborUnitPrice: DEFAULT_LABOR_UNIT_PRICE,
};

export function normalizeCompany(company) {
  return {
    ...DEFAULT_COMPANY,
    ...company,
    standardLaborUnitPrice: Number(
      company?.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE
    ),
  };
}

export function normalizeClient(client) {
  return {
    ...DEFAULT_CLIENT_SETTINGS,
    ...client,
    sp: Number(client.sp ?? 0),
    aa: Number(client.aa ?? 0),
    cf: Number(client.cf ?? 0),
    floor: Number(client.floor ?? 0),
    sheet: Number(client.sheet ?? 0),
    pasteLabor: Number(client.pasteLabor ?? 0),
    substrate: Number(client.substrate ?? 0),
    auxiliary: Number(client.auxiliary ?? 0),
    waste: Number(client.waste ?? 0),
    transport: Number(client.transport ?? 0),
    standardLaborUnitPrice: Number(
      client.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE
    ),
    standardOutsourcingSqmUnitPrice: Number(client.standardOutsourcingSqmUnitPrice ?? 0),
    standardTargetProfitRate: Number(
      client.standardTargetProfitRate ?? DEFAULT_TARGET_PROFIT_RATE
    ),
  };
}

export function emptyClientForm() {
  return {
    name: "",
    sp: 230,
    aa: 415,
    cf: 150,
    floor: 650,
    sheet: 800,
    ...DEFAULT_CLIENT_SETTINGS,
  };
}

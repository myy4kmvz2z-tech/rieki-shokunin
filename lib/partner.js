import {
  DEFAULT_CLIENT_SETTINGS,
  normalizeClient,
} from "./constants";

export const PARTNER_STORAGE_KEY = "rieki-partners";
export const LEGACY_CLIENT_STORAGE_KEY = "rieki-clients";
export const LEGACY_CUSTOMER_STORAGE_KEY = "rieki-customers";

export const PARTNER_COMPANY_FIELDS = [
  { key: "name", label: "会社名", required: true },
  { key: "contactPerson", label: "担当者" },
  { key: "phone", label: "電話" },
  { key: "email", label: "メール" },
  { key: "line", label: "LINE" },
  { key: "address", label: "住所" },
];

export const PARTNER_BILLING_FIELDS = [
  { key: "closingDay", label: "締日" },
  { key: "paymentDay", label: "支払日" },
  { key: "paymentMethod", label: "支払方法" },
  { key: "bankAccount", label: "振込先" },
];

const PARTNER_TEXT_KEYS = [
  "name",
  "contactPerson",
  "phone",
  "email",
  "line",
  "address",
  "closingDay",
  "paymentDay",
  "paymentMethod",
  "bankAccount",
  "memo",
];

function mapLegacyCustomerFields(customer) {
  if (!customer) return {};

  return {
    contactPerson: customer.contactPerson,
    phone: customer.phone,
    email: customer.email,
    line: customer.line,
    address: customer.address,
    closingDay: customer.closingDay,
    paymentDay: customer.paymentDay,
    paymentMethod: customer.paymentMethod,
    bankAccount: customer.bankAccount,
    memo: customer.memo,
  };
}

export function normalizePartner(partner) {
  const pricing = normalizeClient({
    ...DEFAULT_CLIENT_SETTINGS,
    ...partner,
    name: partner?.name ?? partner?.companyName ?? "",
  });

  const normalized = { ...pricing };

  PARTNER_TEXT_KEYS.forEach((key) => {
    normalized[key] = String(normalized[key] ?? "").trim();
  });

  if (!normalized.name && partner?.companyName) {
    normalized.name = String(partner.companyName).trim();
  }

  if (partner?.id != null && partner.id !== "") {
    normalized.id = partner.id;
  }

  return normalized;
}

export function emptyPartnerForm() {
  return normalizePartner({
    name: "",
    sp: 230,
    aa: 415,
    cf: 150,
    floor: 650,
    sheet: 800,
    ...DEFAULT_CLIENT_SETTINGS,
  });
}

export function createPartnerSnapshot(partner) {
  if (!partner) return null;

  const normalized = normalizePartner(partner);
  return {
    id: partner.id ?? null,
    name: normalized.name,
    contactPerson: normalized.contactPerson,
    phone: normalized.phone,
    email: normalized.email,
    line: normalized.line,
    address: normalized.address,
    closingDay: normalized.closingDay,
    paymentDay: normalized.paymentDay,
    paymentMethod: normalized.paymentMethod,
    bankAccount: normalized.bankAccount,
    memo: normalized.memo,
  };
}

export function findPartnerByName(partners, partnerName) {
  if (!partnerName) return null;
  return partners.find((partner) => partner.name === partnerName) ?? null;
}

export function findPartnerById(partners, partnerId) {
  if (!partnerId) return null;
  return partners.find((partner) => String(partner.id) === String(partnerId)) ?? null;
}

function mergePartnerRecords(clientRecord, customerRecord) {
  return normalizePartner({
    ...clientRecord,
    name: clientRecord?.name ?? customerRecord?.companyName ?? "",
    ...mapLegacyCustomerFields(customerRecord),
  });
}

function readLegacyJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function migratePartnersFromLegacyStorage() {
  const savedPartners = readLegacyJson(PARTNER_STORAGE_KEY);
  if (savedPartners) {
    return savedPartners.map((partner, index) =>
      normalizePartner({
        ...partner,
        id: partner.id ?? Date.now() + index,
      })
    );
  }

  const legacyClients = readLegacyJson(LEGACY_CLIENT_STORAGE_KEY);
  const legacyCustomers = readLegacyJson(LEGACY_CUSTOMER_STORAGE_KEY);
  if (!legacyClients && !legacyCustomers) {
    return [];
  }

  const clientList = legacyClients ?? [];
  const customerList = legacyCustomers ?? [];
  const partners = [];
  const seenNames = new Set();

  clientList.forEach((client, index) => {
    const matchedCustomer = customerList.find(
      (customer) => customer.companyName === client.name
    );
    const partner = mergePartnerRecords(
      {
        ...client,
        id: client.id ?? Date.now() + index,
      },
      matchedCustomer
    );

    if (!partner.name) return;
    partners.push(partner);
    seenNames.add(partner.name);
  });

  customerList.forEach((customer, index) => {
    const companyName = String(customer.companyName ?? "").trim();
    if (!companyName || seenNames.has(companyName)) return;

    partners.push(
      normalizePartner({
        id: customer.id ?? Date.now() + index + 1000,
        name: companyName,
        ...mapLegacyCustomerFields(customer),
        ...DEFAULT_CLIENT_SETTINGS,
      })
    );
    seenNames.add(companyName);
  });

  if (partners.length === 0) {
    return [];
  }

  localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(partners));
  return partners;
}

export function getEstimatePartnerRecord(estimate) {
  if (estimate?.partner) {
    return {
      ...estimate.partner,
      name: estimate.partner.name ?? estimate.partner.companyName ?? estimate.client ?? "",
    };
  }

  if (estimate?.customer) {
    return {
      id: estimate.customer.id ?? null,
      name: estimate.customer.companyName ?? estimate.client ?? "",
      contactPerson: estimate.customer.contactPerson,
      phone: estimate.customer.phone,
      email: estimate.customer.email,
      line: estimate.customer.line,
      address: estimate.customer.address,
      closingDay: estimate.customer.closingDay,
      paymentDay: estimate.customer.paymentDay,
      paymentMethod: estimate.customer.paymentMethod,
      bankAccount: estimate.customer.bankAccount,
      memo: estimate.customer.memo,
    };
  }

  return null;
}

export function getPartnerRecipientName(estimate) {
  const partner = getEstimatePartnerRecord(estimate);
  return partner?.name?.trim() || estimate?.client || "";
}

export function buildPartnerRecipientLines(estimate) {
  const partner = getEstimatePartnerRecord(estimate);
  if (!partner) return [];

  return [
    partner.contactPerson ? `担当：${partner.contactPerson}` : null,
    partner.phone ? `TEL ${partner.phone}` : null,
    partner.email ? `Mail ${partner.email}` : null,
    partner.line ? `LINE ${partner.line}` : null,
    partner.address ? `住所：${partner.address}` : null,
  ].filter(Boolean);
}

export function buildPartnerPaymentLines(estimate) {
  const partner = getEstimatePartnerRecord(estimate);
  if (!partner) return [];

  return [
    partner.closingDay ? `締日：${partner.closingDay}` : null,
    partner.paymentDay ? `支払日：${partner.paymentDay}` : null,
    partner.paymentMethod ? `支払方法：${partner.paymentMethod}` : null,
    partner.bankAccount ? `振込先：${partner.bankAccount}` : null,
  ].filter(Boolean);
}

export function buildPartnerDocumentExtras(estimate) {
  const recipientName = getPartnerRecipientName(estimate);
  const recipientLines = buildPartnerRecipientLines(estimate);
  const paymentLines = buildPartnerPaymentLines(estimate);

  return {
    recipientName,
    clientLine: recipientName ? `${recipientName} 御中` : null,
    recipientLines,
    paymentLines,
    paymentKeyValues: paymentLines.map((line) => {
      const separatorIndex = line.indexOf("：");
      if (separatorIndex === -1) {
        return { label: line, value: "" };
      }
      return {
        label: line.slice(0, separatorIndex),
        value: line.slice(separatorIndex + 1),
      };
    }),
  };
}

export function applyPartnerSelection({ partner, siteAddress }) {
  if (!partner) {
    return {
      partnerSnapshot: null,
      siteAddress,
    };
  }

  return {
    partnerSnapshot: createPartnerSnapshot(partner),
    siteAddress: siteAddress.trim() ? siteAddress : partner.address,
  };
}

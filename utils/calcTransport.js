export const DEFAULT_TRANSPORT_KM_RATE = 40;

export const TRANSPORT_FEE_METHODS = [
  { value: "gps", label: "GPS自動計算" },
  { value: "manual", label: "手入力" },
];

export const TRANSPORT_MODE_GPS = "gps";
export const TRANSPORT_MODE_DISTANCE = "distance";
export const TRANSPORT_MODE_FIXED = "fixed";

export const TRANSPORT_MODES = [
  { value: TRANSPORT_MODE_DISTANCE, label: "距離計算" },
  { value: TRANSPORT_MODE_FIXED, label: "一式入力" },
];

export const TRIP_TYPES = [
  { value: "oneWay", label: "片道" },
  { value: "roundTrip", label: "往復" },
];

export function getDefaultTripType(company) {
  return company?.transportRoundTripDefault === false ? "oneWay" : "roundTrip";
}

export function getDefaultKmRate(company) {
  return Number(company?.transportKmRate ?? DEFAULT_TRANSPORT_KM_RATE);
}

export function calcDistanceTransport({ distanceKm, kmRate, tripType }) {
  const amount = Number(distanceKm || 0) * Number(kmRate ?? DEFAULT_TRANSPORT_KM_RATE);
  return Math.round(tripType === "roundTrip" ? amount * 2 : amount);
}

export function calcTransportTotal({
  transportMode = TRANSPORT_MODE_FIXED,
  distanceKm,
  kmRate,
  tripType,
  fixedTransport,
  transport,
}) {
  if (transportMode === TRANSPORT_MODE_DISTANCE || transportMode === TRANSPORT_MODE_GPS) {
    return calcDistanceTransport({ distanceKm, kmRate, tripType });
  }
  return Number(fixedTransport ?? transport ?? 0);
}

export function normalizeTransportFeeMethod(estimate) {
  if (estimate?.transportFeeMethod === "gps" || estimate?.transportFeeMethod === "manual") {
    return estimate.transportFeeMethod;
  }
  if (estimate?.transportMode === TRANSPORT_MODE_GPS) return "gps";
  return "manual";
}

export function normalizeEstimateTransport(estimate, company = {}) {
  if (!estimate) {
    return {
      transportFeeMethod: "manual",
      transportMode: TRANSPORT_MODE_FIXED,
      distanceKm: 0,
      tripType: getDefaultTripType(company),
      kmRate: getDefaultKmRate(company),
      fixedTransport: 0,
      parkingFee: 0,
      transportCost: 0,
      currentLat: null,
      currentLng: null,
      currentLocationLabel: "",
    };
  }

  const transportFeeMethod = normalizeTransportFeeMethod(estimate);
  const hasLegacyDistance =
    estimate.transportMode == null && Number(estimate.distanceKm) > 0;
  let transportMode =
    estimate.transportMode ?? (hasLegacyDistance ? TRANSPORT_MODE_DISTANCE : TRANSPORT_MODE_FIXED);

  if (transportFeeMethod === "gps") {
    transportMode = TRANSPORT_MODE_GPS;
  }

  const distanceKm = Number(estimate.distanceKm ?? 0);
  const tripType = estimate.tripType ?? getDefaultTripType(company);
  const kmRate = Number(estimate.kmRate ?? getDefaultKmRate(company));
  const fixedTransport = Number(
    estimate.fixedTransport ??
      estimate.transport ??
      (transportMode === TRANSPORT_MODE_FIXED ? estimate.transportCost : 0) ??
      0
  );
  const parkingFee = Number(estimate.parkingFee ?? 0);
  const transportCost = Number(
    estimate.transportCost ??
      calcTransportTotal({
        transportMode,
        distanceKm,
        kmRate,
        tripType,
        fixedTransport,
      })
  );

  return {
    transportFeeMethod,
    transportMode,
    distanceKm,
    tripType,
    kmRate,
    fixedTransport,
    parkingFee,
    transportCost,
    currentLat: estimate.currentLat ?? null,
    currentLng: estimate.currentLng ?? null,
    currentLocationLabel: estimate.currentLocationLabel ?? "",
  };
}

export function getTransportModeLabel(estimate, company = {}) {
  const t = normalizeEstimateTransport(estimate, company);
  if (t.transportMode === TRANSPORT_MODE_GPS) {
    const trip = t.tripType === "roundTrip" ? "往復" : "片道";
    return `GPS自動計算（${trip}）`;
  }
  if (t.transportMode === TRANSPORT_MODE_DISTANCE) {
    const trip = t.tripType === "roundTrip" ? "往復" : "片道";
    return `距離計算（${trip}）`;
  }
  return "手入力（一式）";
}

export function getTransportDetailLabel(estimate, company = {}) {
  const t = normalizeEstimateTransport(estimate, company);
  if (t.transportMode === TRANSPORT_MODE_GPS) {
    const trip = t.tripType === "roundTrip" ? "往復" : "片道";
    return `${t.distanceKm}km × ¥${t.kmRate}/km（${trip}）`;
  }
  if (t.transportMode === TRANSPORT_MODE_DISTANCE) {
    const trip = t.tripType === "roundTrip" ? "往復" : "片道";
    return `${t.distanceKm}km × ¥${t.kmRate}/km（${trip}）`;
  }
  return `固定 ${Number(t.fixedTransport).toLocaleString()}円`;
}

export function getInitialTransportState(
  initialEstimate,
  clientDefaultTransport = 0,
  company = {}
) {
  const defaultKmRate = getDefaultKmRate(company);
  const defaultTripType = getDefaultTripType(company);

  if (!initialEstimate) {
    return {
      transportFeeMethod: "manual",
      transportMode: TRANSPORT_MODE_FIXED,
      distanceKm: 0,
      tripType: defaultTripType,
      kmRate: defaultKmRate,
      fixedTransport: clientDefaultTransport,
      parkingFee: 0,
      currentLat: null,
      currentLng: null,
      currentLocationLabel: "",
    };
  }

  const normalized = normalizeEstimateTransport(initialEstimate, company);
  if (initialEstimate.transportMode == null && Number(initialEstimate.distanceKm) > 0) {
    return normalized;
  }
  if (initialEstimate.transportMode == null) {
    return {
      ...normalized,
      fixedTransport:
        initialEstimate.fixedTransport ??
        initialEstimate.transport ??
        initialEstimate.transportCost ??
        clientDefaultTransport,
    };
  }
  return normalized;
}

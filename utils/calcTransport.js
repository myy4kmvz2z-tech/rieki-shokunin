export const DEFAULT_TRANSPORT_KM_RATE = 40;
export const DEFAULT_FUEL_EFFICIENCY_KM_PER_L = 9;
export const DEFAULT_GASOLINE_PRICE_PER_L = 200;

export const TRANSPORT_FEE_METHODS = [
  { value: "gps", label: "GPS自動" },
  { value: "manual", label: "手入力" },
];

export const TRANSPORT_MODE_GPS = "gps";
export const TRANSPORT_MODE_DISTANCE = "distance";
export const TRANSPORT_MODE_FIXED = "fixed";

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

export function getDefaultFuelEfficiency(company = {}) {
  return Number(company?.fuelEfficiencyKmPerL ?? DEFAULT_FUEL_EFFICIENCY_KM_PER_L);
}

export function getDefaultGasolinePrice(company = {}) {
  return Number(company?.gasolinePricePerL ?? DEFAULT_GASOLINE_PRICE_PER_L);
}

export function getTripTypeLabel(tripType) {
  return tripType === "roundTrip" ? "往復" : "片道";
}

/** @deprecated 旧km単価方式。燃費設定がないデータ向け */
export function calcDistanceTransport({ distanceKm, kmRate, tripType }) {
  const amount = Number(distanceKm || 0) * Number(kmRate ?? DEFAULT_TRANSPORT_KM_RATE);
  return Math.round(tripType === "roundTrip" ? amount * 2 : amount);
}

export function calcFuelTransport({
  distanceKm,
  fuelEfficiencyKmPerL,
  gasolinePricePerL,
  tripType,
}) {
  const distance = Number(distanceKm || 0);
  const fuel = Number(fuelEfficiencyKmPerL || 0);
  const price = Number(gasolinePricePerL || 0);
  if (distance <= 0 || fuel <= 0 || price <= 0) return 0;

  const totalDistance = tripType === "roundTrip" ? distance * 2 : distance;
  return Math.round((totalDistance / fuel) * price);
}

export function calcTransportTotal({
  transportMode = TRANSPORT_MODE_FIXED,
  transportFeeMethod = "manual",
  distanceKm,
  kmRate,
  tripType,
  fixedTransport,
  transport,
  fuelEfficiencyKmPerL,
  gasolinePricePerL,
}) {
  if (
    transportFeeMethod === "gps" ||
    transportMode === TRANSPORT_MODE_GPS ||
    transportMode === TRANSPORT_MODE_DISTANCE
  ) {
    const fuel = Number(fuelEfficiencyKmPerL || 0);
    const gasPrice = Number(gasolinePricePerL || 0);
    if (fuel > 0 && gasPrice > 0) {
      return calcFuelTransport({
        distanceKm,
        fuelEfficiencyKmPerL: fuel,
        gasolinePricePerL: gasPrice,
        tripType,
      });
    }
    return calcDistanceTransport({ distanceKm, kmRate, tripType });
  }
  return Number(fixedTransport ?? transport ?? 0);
}

export function formatTransportFuelSummary({
  fuelEfficiencyKmPerL,
  gasolinePricePerL,
  distanceKm,
  tripType,
  transportCost,
}) {
  const trip = getTripTypeLabel(tripType);
  const fuel = Number(fuelEfficiencyKmPerL || 0);
  const gasPrice = Number(gasolinePricePerL || 0);
  const distance = Number(distanceKm || 0);
  const cost = Number(transportCost || 0);

  return {
    fuelLine: `${fuel}km/L`,
    gasLine: `ガソリン ${gasPrice.toLocaleString()}円/L`,
    distanceLine: `距離 ${distance.toLocaleString()}km ${trip}`,
    costLine: `交通費 ${cost.toLocaleString()}円`,
  };
}

export function calcTravelCostTotal({ transportCost, highwayToll, parkingFee }) {
  return (
    Number(transportCost || 0) +
    Number(highwayToll || 0) +
    Number(parkingFee || 0)
  );
}

export function getEffectiveTravelDistanceKm(estimate, company = {}) {
  const t = normalizeEstimateTransport(estimate, company);
  if (t.transportFeeMethod !== "gps" && t.transportMode !== TRANSPORT_MODE_GPS) {
    return 0;
  }
  const multiplier = t.tripType === "roundTrip" ? 2 : 1;
  return Number((t.distanceKm * multiplier).toFixed(1));
}

export function getTravelCostBreakdown(estimate, company = {}) {
  const t = normalizeEstimateTransport(estimate, company);
  const transportCost = calcTransportTotal({
    transportMode: t.transportMode,
    transportFeeMethod: t.transportFeeMethod,
    distanceKm: t.distanceKm,
    kmRate: t.kmRate,
    tripType: t.tripType,
    fixedTransport: t.fixedTransport,
    fuelEfficiencyKmPerL: t.fuelEfficiencyKmPerL,
    gasolinePricePerL: t.gasolinePricePerL,
  });
  const highwayToll = Number(t.highwayToll || 0);
  const parkingFee = Number(t.parkingFee || 0);
  return {
    transportCost,
    highwayToll,
    parkingFee,
    travelCostTotal: calcTravelCostTotal({ transportCost, highwayToll, parkingFee }),
    travelDistanceKm: getEffectiveTravelDistanceKm(estimate, company),
  };
}

export function normalizeTransportFeeMethod(estimate) {
  if (estimate?.transportFeeMethod === "gps" || estimate?.transportFeeMethod === "manual") {
    return estimate.transportFeeMethod;
  }
  if (estimate?.transportMode === TRANSPORT_MODE_GPS) return "gps";
  if (Number(estimate?.distanceKm) > 0 && estimate?.transportMode === TRANSPORT_MODE_DISTANCE) {
    return "gps";
  }
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
      fuelEfficiencyKmPerL: getDefaultFuelEfficiency(company),
      gasolinePricePerL: getDefaultGasolinePrice(company),
      fixedTransport: 0,
      highwayToll: 0,
      parkingFee: 0,
      transportCost: 0,
      travelCostTotal: 0,
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
  } else if (transportFeeMethod === "manual") {
    transportMode = TRANSPORT_MODE_FIXED;
  }

  const distanceKm = Number(estimate.distanceKm ?? 0);
  const tripType = estimate.tripType ?? getDefaultTripType(company);
  const kmRate = Number(estimate.kmRate ?? getDefaultKmRate(company));
  const fuelEfficiencyKmPerL = Number(
    estimate.fuelEfficiencyKmPerL ?? getDefaultFuelEfficiency(company)
  );
  const gasolinePricePerL = Number(
    estimate.gasolinePricePerL ?? getDefaultGasolinePrice(company)
  );
  const fixedTransport = Number(
    estimate.fixedTransport ??
      estimate.transport ??
      (transportMode === TRANSPORT_MODE_FIXED ? estimate.transportCost : 0) ??
      0
  );
  const highwayToll = Number(estimate.highwayToll ?? 0);
  const parkingFee = Number(estimate.parkingFee ?? 0);
  const transportCost = calcTransportTotal({
    transportMode,
    transportFeeMethod,
    distanceKm,
    kmRate,
    tripType,
    fixedTransport,
    fuelEfficiencyKmPerL,
    gasolinePricePerL,
  });
  const travelCostTotal = calcTravelCostTotal({
    transportCost,
    highwayToll,
    parkingFee,
  });

  return {
    transportFeeMethod,
    transportMode,
    distanceKm,
    tripType,
    kmRate,
    fuelEfficiencyKmPerL,
    gasolinePricePerL,
    fixedTransport,
    highwayToll,
    parkingFee,
    transportCost,
    travelCostTotal,
    currentLat: estimate.currentLat ?? null,
    currentLng: estimate.currentLng ?? null,
    currentLocationLabel: estimate.currentLocationLabel ?? "",
  };
}

export function getTransportModeLabel(estimate, company = {}) {
  const t = normalizeEstimateTransport(estimate, company);
  if (t.transportFeeMethod === "gps") {
    const trip = getTripTypeLabel(t.tripType);
    return `GPS自動（${trip}）`;
  }
  return "手入力";
}

export function getTransportDetailLabel(estimate, company = {}) {
  const t = normalizeEstimateTransport(estimate, company);
  if (t.transportFeeMethod === "gps") {
    const summary = formatTransportFuelSummary({
      fuelEfficiencyKmPerL: t.fuelEfficiencyKmPerL,
      gasolinePricePerL: t.gasolinePricePerL,
      distanceKm: t.distanceKm,
      tripType: t.tripType,
      transportCost: t.transportCost,
    });
    return `${summary.fuelLine} / ${summary.gasLine} / ${summary.distanceLine} / ${summary.costLine}`;
  }
  return `交通費 ${Number(t.fixedTransport).toLocaleString()}円`;
}

export function getInitialTransportState(
  initialEstimate,
  clientDefaultTransport = 0,
  company = {}
) {
  const defaultKmRate = getDefaultKmRate(company);
  const defaultTripType = getDefaultTripType(company);
  const defaultFuelEfficiency = getDefaultFuelEfficiency(company);
  const defaultGasolinePrice = getDefaultGasolinePrice(company);

  if (!initialEstimate) {
    return {
      transportFeeMethod: "manual",
      transportMode: TRANSPORT_MODE_FIXED,
      distanceKm: 0,
      tripType: defaultTripType,
      kmRate: defaultKmRate,
      fuelEfficiencyKmPerL: defaultFuelEfficiency,
      gasolinePricePerL: defaultGasolinePrice,
      fixedTransport: clientDefaultTransport,
      highwayToll: 0,
      parkingFee: 0,
      currentLat: null,
      currentLng: null,
      currentLocationLabel: "",
    };
  }

  const normalized = normalizeEstimateTransport(initialEstimate, company);
  if (initialEstimate.transportMode == null && normalized.transportFeeMethod === "manual") {
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

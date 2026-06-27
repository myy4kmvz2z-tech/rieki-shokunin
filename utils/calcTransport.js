export const DEFAULT_KM_RATE = 30;

export const TRANSPORT_MODES = [
  { value: "distance", label: "距離計算" },
  { value: "fixed", label: "一式入力" },
];

export const TRIP_TYPES = [
  { value: "oneWay", label: "片道" },
  { value: "roundTrip", label: "往復" },
];

export function calcDistanceTransport({ distanceKm, kmRate, tripType }) {
  const amount = Number(distanceKm || 0) * Number(kmRate ?? DEFAULT_KM_RATE);
  return Math.round(tripType === "roundTrip" ? amount * 2 : amount);
}

export function calcTransportTotal({
  transportMode = "fixed",
  distanceKm,
  kmRate,
  tripType,
  fixedTransport,
  transport,
}) {
  if (transportMode === "distance") {
    return calcDistanceTransport({ distanceKm, kmRate, tripType });
  }
  return Number(fixedTransport ?? transport ?? 0);
}

export function normalizeEstimateTransport(estimate) {
  if (!estimate) {
    return {
      transportMode: "fixed",
      distanceKm: 0,
      tripType: "oneWay",
      kmRate: DEFAULT_KM_RATE,
      fixedTransport: 0,
      parkingFee: 0,
      transportCost: 0,
    };
  }

  const hasLegacyDistance =
    estimate.transportMode == null && Number(estimate.distanceKm) > 0;
  const transportMode =
    estimate.transportMode ?? (hasLegacyDistance ? "distance" : "fixed");
  const distanceKm = Number(estimate.distanceKm ?? 0);
  const tripType = estimate.tripType ?? "oneWay";
  const kmRate = Number(estimate.kmRate ?? DEFAULT_KM_RATE);
  const fixedTransport = Number(
    estimate.fixedTransport ??
      estimate.transport ??
      (transportMode === "fixed" ? estimate.transportCost : 0) ??
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
    transportMode,
    distanceKm,
    tripType,
    kmRate,
    fixedTransport,
    parkingFee,
    transportCost,
  };
}

export function getTransportModeLabel(estimate) {
  const t = normalizeEstimateTransport(estimate);
  if (t.transportMode === "distance") {
    const trip = t.tripType === "roundTrip" ? "往復" : "片道";
    return `距離計算（${trip}）`;
  }
  return "一式入力";
}

export function getTransportDetailLabel(estimate) {
  const t = normalizeEstimateTransport(estimate);
  if (t.transportMode === "distance") {
    const trip = t.tripType === "roundTrip" ? "往復" : "片道";
    return `${t.distanceKm}km × ¥${t.kmRate}/km（${trip}）`;
  }
  return `固定 ${Number(t.fixedTransport).toLocaleString()}円`;
}

export function getInitialTransportState(initialEstimate, clientDefaultTransport = 0) {
  if (!initialEstimate) {
    return {
      transportMode: "fixed",
      distanceKm: 0,
      tripType: "oneWay",
      kmRate: DEFAULT_KM_RATE,
      fixedTransport: clientDefaultTransport,
      parkingFee: 0,
    };
  }

  const normalized = normalizeEstimateTransport(initialEstimate);
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

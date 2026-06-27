/**
 * Google Maps 連携（フェーズ1: 土台のみ）
 * TODO: Phase 2 - Distance Matrix API の通信処理を implement
 */

export function isGoogleMapsApiConfigured(company) {
  return Boolean(String(company?.googleMapsApiKey ?? "").trim());
}

export function getGoogleMapsApiStatusMessage(company) {
  if (!isGoogleMapsApiConfigured(company)) {
    return "Google Maps API未設定";
  }
  return "";
}

/**
 * TODO: Phase 2 - Google Maps Distance Matrix API を呼び出し、距離(km)を返す
 * @returns {Promise<{ ok: boolean, distanceKm?: number, message?: string }>}
 */
export async function fetchDistanceMatrix({ origin, destination, company }) {
  if (!isGoogleMapsApiConfigured(company)) {
    return { ok: false, message: "Google Maps API未設定" };
  }

  // TODO: Phase 2 - APIキーを使って Distance Matrix API にリクエスト
  void origin;
  void destination;

  return {
    ok: false,
    message: "Distance Matrix API は未実装です（Phase 2）",
  };
}

export function buildGoogleMapsRouteUrl({ originLat, originLng, destinationAddress }) {
  const destination = encodeURIComponent(destinationAddress || "");
  if (!destination) return "https://www.google.com/maps";

  if (originLat != null && originLng != null) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destination}&travelmode=driving`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export function formatCurrentLocation({ lat, lng }) {
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("この端末では位置情報を取得できません。"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

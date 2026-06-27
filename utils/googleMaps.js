/**
 * Google Maps 連携（Ver.1: 土台 + 手動距離フォールバック）
 * TODO: Google Maps Distance Matrix API による GPS 自動距離取得
 * TODO: 現在地の GPS 自動取得（画面表示時）
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
 * TODO: Google Maps Distance Matrix API を呼び出し、距離(km)を返す
 */
export async function fetchDistanceMatrix({ origin, destination, company }) {
  if (!isGoogleMapsApiConfigured(company)) {
    return { ok: false, message: "Google Maps API未設定", needsManual: true };
  }

  // TODO: APIキーを使って Distance Matrix API にリクエスト
  void origin;
  void destination;
  void company;

  return {
    ok: false,
    message: "Distance Matrix API は未実装です",
    needsManual: true,
  };
}

/**
 * 距離取得（Ver.1: API未設定時は手入力フォールバック）
 */
export async function acquireTravelDistance({ origin, destinationAddress, company }) {
  if (!destinationAddress?.trim()) {
    return { ok: false, message: "現場住所を入力してください。" };
  }

  const apiResult = await fetchDistanceMatrix({
    origin,
    destination: destinationAddress.trim(),
    company,
  });

  if (apiResult.ok && apiResult.distanceKm != null) {
    return apiResult;
  }

  return {
    ...apiResult,
    needsManual: true,
  };
}

export function promptManualDistanceKm(currentKm = 0) {
  const input = window.prompt(
    `Google Maps API未設定\n距離 km を入力してください`,
    currentKm > 0 ? String(currentKm) : ""
  );
  if (input == null) return null;
  const value = parseFloat(input.replace(/,/g, ""));
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.round(value * 10) / 10;
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

/**
 * TODO: 現在地自動取得（画面表示時に Geolocation を実行）
 */
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

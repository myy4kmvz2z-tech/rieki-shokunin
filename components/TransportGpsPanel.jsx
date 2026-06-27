"use client";

import { useState } from "react";
import {
  buildGoogleMapsRouteUrl,
  formatCurrentLocation,
  getCurrentPosition,
  getGoogleMapsApiStatusMessage,
} from "../utils/googleMaps";
import { s } from "../lib/styles";

export default function TransportGpsPanel({
  company,
  siteAddress,
  currentLat,
  currentLng,
  currentLocationLabel,
  distanceKm,
  tripType,
  kmRate,
  onLocationChange,
}) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const apiStatus = getGoogleMapsApiStatusMessage(company);

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const position = await getCurrentPosition();
      onLocationChange({
        lat: position.lat,
        lng: position.lng,
        label: formatCurrentLocation(position),
      });
    } catch (error) {
      alert(error?.message || "現在地を取得できませんでした。");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleOpenGoogleMaps = () => {
    if (!siteAddress.trim()) {
      alert("現場住所を入力してください。");
      return;
    }
    const url = buildGoogleMapsRouteUrl({
      originLat: currentLat,
      originLng: currentLng,
      destinationAddress: siteAddress.trim(),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const tripLabel = tripType === "roundTrip" ? "往復" : "片道";

  return (
    <div style={s.gpsPanel}>
      <button
        type="button"
        style={s.gpsBtn}
        onClick={handleGetCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? "取得中…" : "現在地を取得"}
      </button>

      <p style={s.gpsMeta}>
        現在地：
        {currentLocationLabel || "未取得"}
      </p>

      <button type="button" style={s.gpsBtnOutline} onClick={handleOpenGoogleMaps}>
        Google Mapsでルート検索
      </button>

      <p style={apiStatus ? s.gpsApiNotice : s.gpsApiReady}>
        {apiStatus || "APIキー設定済み（Distance Matrix は Phase 2）"}
      </p>

      <div style={s.gpsSummary}>
        <p style={s.gpsSummaryRow}>
          <span>距離</span>
          <span>{Number(distanceKm || 0)} km</span>
        </p>
        <p style={s.gpsSummaryRow}>
          <span>単価</span>
          <span>¥{Number(kmRate || 0)}/km（{tripLabel}）</span>
        </p>
      </div>
    </div>
  );
}

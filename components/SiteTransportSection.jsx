"use client";

import { useState } from "react";
import {
  acquireTravelDistance,
  buildGoogleMapsRouteUrl,
  formatCurrentLocation,
  getCurrentPosition,
  getGoogleMapsApiStatusMessage,
  promptManualDistanceKm,
} from "../utils/googleMaps";
import SafeButton from "./SafeButton";
import { s } from "../lib/styles";

export default function SiteTransportSection({
  company,
  siteAddress,
  distanceKm,
  currentLat,
  currentLng,
  currentLocationLabel,
  onLocationChange,
  onDistanceChange,
}) {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingDistance, setLoadingDistance] = useState(false);
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

  const handleAcquireDistance = async () => {
    if (!siteAddress.trim()) {
      alert("現場住所を入力してください。");
      return;
    }

    setLoadingDistance(true);
    try {
      const result = await acquireTravelDistance({
        origin:
          currentLat != null && currentLng != null
            ? { lat: currentLat, lng: currentLng }
            : null,
        destinationAddress: siteAddress.trim(),
        company,
      });

      if (result.ok && result.distanceKm != null) {
        onDistanceChange(result.distanceKm);
        return;
      }

      const manualKm = promptManualDistanceKm(distanceKm);
      if (manualKm != null) {
        onDistanceChange(manualKm);
      }
    } finally {
      setLoadingDistance(false);
    }
  };

  return (
    <div style={s.siteTransportBox}>
      <SafeButton
        type="button"
        style={s.gpsBtn}
        onPress={handleGetCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? "取得中…" : "現在地取得"}
      </SafeButton>

      <p style={s.gpsMeta}>現在地：{currentLocationLabel || "未取得"}</p>

      <SafeButton type="button" style={s.gpsBtnOutline} onPress={handleOpenGoogleMaps}>
        Googleマップを開く
      </SafeButton>

      <SafeButton
        type="button"
        style={s.gpsBtnSecondary}
        onPress={handleAcquireDistance}
        disabled={loadingDistance}
      >
        {loadingDistance ? "取得中…" : "距離取得"}
      </SafeButton>

      <p style={apiStatus ? s.gpsApiNotice : s.gpsApiReady}>
        {apiStatus || "APIキー設定済み（自動距離は将来対応）"}
      </p>
    </div>
  );
}

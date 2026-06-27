"use client";

import { useState } from "react";
import { DEFAULT_COMPANY, DEFAULT_LABOR_UNIT_PRICE } from "../lib/constants";
import { TRIP_TYPES } from "../utils/calcTransport";
import { s } from "../lib/styles";
import { Input, RadioGroup } from "./FormFields";

export default function CompanySettings({ company, onBack, onSave }) {
  const [form, setForm] = useState({
    ...DEFAULT_COMPANY,
    ...company,
    standardLaborUnitPrice: company.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE,
    monthlyTargetProfit: company.monthlyTargetProfit ?? DEFAULT_COMPANY.monthlyTargetProfit,
    dailyTargetProfit: company.dailyTargetProfit ?? DEFAULT_COMPANY.dailyTargetProfit,
    transportKmRate: company.transportKmRate ?? DEFAULT_COMPANY.transportKmRate,
    transportRoundTripDefault:
      company.transportRoundTripDefault ?? DEFAULT_COMPANY.transportRoundTripDefault,
    googleMapsApiKey: company.googleMapsApiKey ?? "",
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("会社名を入力してください。");
      return;
    }
    onSave({
      name: form.name.trim(),
      address: form.address.trim(),
      tel: form.tel.trim(),
      representative: form.representative.trim(),
      invoiceNumber: form.invoiceNumber.trim(),
      standardLaborUnitPrice: Number(form.standardLaborUnitPrice || DEFAULT_LABOR_UNIT_PRICE),
      monthlyTargetProfit: Number(form.monthlyTargetProfit || 0),
      dailyTargetProfit: Number(form.dailyTargetProfit || 0),
      transportKmRate: Number(form.transportKmRate || DEFAULT_COMPANY.transportKmRate),
      transportRoundTripDefault: Boolean(form.transportRoundTripDefault),
      googleMapsApiKey: form.googleMapsApiKey.trim(),
    });
    alert("保存しました。");
  };

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>会社設定</h1>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>基本情報</h2>
        <div style={s.form}>
          <Input label="会社名" value={form.name} setValue={(v) => setField("name", v)} />
          <Input label="住所" value={form.address} setValue={(v) => setField("address", v)} />
          <Input label="電話番号" value={form.tel} setValue={(v) => setField("tel", v)} />
          <Input
            label="代表者"
            value={form.representative}
            setValue={(v) => setField("representative", v)}
          />
          <Input
            label="インボイス登録番号"
            value={form.invoiceNumber}
            setValue={(v) => setField("invoiceNumber", v)}
          />
          <Input
            label="標準常用単価 円/人工"
            value={form.standardLaborUnitPrice}
            setValue={(v) => setField("standardLaborUnitPrice", v)}
            type="number"
          />
          <Input
            label="今月目標利益 円"
            value={form.monthlyTargetProfit}
            setValue={(v) => setField("monthlyTargetProfit", v)}
            type="number"
          />
          <Input
            label="今日目標利益 円"
            value={form.dailyTargetProfit}
            setValue={(v) => setField("dailyTargetProfit", v)}
            type="number"
          />
        </div>
      </section>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>交通費設定</h2>
        <div style={s.form}>
          <Input
            label="1kmあたり単価 円/km"
            value={form.transportKmRate}
            setValue={(v) => setField("transportKmRate", v)}
            type="number"
          />
          <RadioGroup
            label="片道 / 往復"
            value={form.transportRoundTripDefault ? "roundTrip" : "oneWay"}
            setValue={(v) => setField("transportRoundTripDefault", v === "roundTrip")}
            options={TRIP_TYPES}
          />
        </div>
      </section>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>Google Maps API（将来対応）</h2>
        <p style={s.hint}>
          GPS自動距離取得用。Ver.1 では保存のみで通信は行いません。
        </p>
        {/* TODO: Google Maps Distance Matrix API 通信 */}
        {/* TODO: GPS自動取得・現在地自動取得 */}
        <div style={s.form}>
          <Input
            label="Google Maps APIキー"
            value={form.googleMapsApiKey}
            setValue={(v) => setField("googleMapsApiKey", v)}
          />
        </div>
      </section>

      <button style={s.save} onClick={handleSave}>保存する</button>
    </main>
  );
}

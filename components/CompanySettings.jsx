"use client";

import { useState } from "react";
import { DEFAULT_COMPANY, DEFAULT_LABOR_UNIT_PRICE } from "../lib/constants";
import { s } from "../lib/styles";
import { Input } from "./FormFields";

export default function CompanySettings({ company, onBack, onSave }) {
  const [form, setForm] = useState({
    ...DEFAULT_COMPANY,
    ...company,
    standardLaborUnitPrice: company.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE,
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
    });
    alert("保存しました。");
  };

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>会社設定</h1>

      <section style={s.listCard}>
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
        </div>
        <button style={s.save} onClick={handleSave}>保存する</button>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { WORK_TYPES } from "../lib/constants";
import {
  emptySiteMasterForm,
  findSiteMaster,
  normalizeSiteMaster,
} from "../lib/siteMaster";
import { getCostStructureForClient, getOutsourcingModeLabel, yen } from "../utils/calcProfit";
import { s } from "../lib/styles";
import { CardButtonGroup, Input, Select } from "./FormFields";

const OUTSOURCING_MODE_OPTIONS = [
  { value: "labor", label: "常用（人工）", icon: "👷" },
  { value: "sqm", label: "請負（㎡）", icon: "📐" },
];

function SiteMasterSettingsForm({ form, setField }) {
  return (
    <>
      <p style={s.formSection}>設定</p>
      <Input label="材料費 円/㎡" value={form.material} setValue={(v) => setField("material", v)} type="number" />
      <Input label="貼り手間 円/㎡" value={form.pasteLabor} setValue={(v) => setField("pasteLabor", v)} type="number" />
      <Input label="下地処理 円/㎡" value={form.substrate} setValue={(v) => setField("substrate", v)} type="number" />
      <Input label="副資材 円/㎡" value={form.auxiliary} setValue={(v) => setField("auxiliary", v)} type="number" />
      <Input label="廃材処分 円/㎡" value={form.waste} setValue={(v) => setField("waste", v)} type="number" />
      <CardButtonGroup
        label="外注方式"
        value={form.outsourcingMode}
        setValue={(v) => setField("outsourcingMode", v)}
        options={OUTSOURCING_MODE_OPTIONS}
      />
      <Input
        label="常用単価 円/人工"
        value={form.laborUnitPrice}
        setValue={(v) => setField("laborUnitPrice", v)}
        type="number"
      />
      <Input
        label="請負単価 円/㎡"
        value={form.outsourcingSqmUnitPrice}
        setValue={(v) => setField("outsourcingSqmUnitPrice", v)}
        type="number"
      />
      <Input
        label="目標利益率 %"
        value={form.targetProfitRate}
        setValue={(v) => setField("targetProfitRate", v)}
        type="number"
      />
    </>
  );
}

function SiteMasterSummary({ master }) {
  const rows = [
    { label: "材料費", value: `${yen(master.material)}/㎡` },
    { label: "貼り手間", value: `${yen(master.pasteLabor)}/㎡` },
    { label: "下地処理", value: `${yen(master.substrate)}/㎡` },
    { label: "副資材", value: `${yen(master.auxiliary)}/㎡` },
    { label: "廃材処分", value: `${yen(master.waste)}/㎡` },
    { label: "外注方式", value: getOutsourcingModeLabel(master.outsourcingMode) },
    { label: "常用単価", value: `${yen(master.laborUnitPrice)}/人工` },
    { label: "請負単価", value: `${yen(master.outsourcingSqmUnitPrice)}/㎡` },
    { label: "目標利益率", value: `${Number(master.targetProfitRate || 0)}%` },
  ];

  return (
    <div style={s.twoColGrid}>
      {rows.map(({ label, value }) => (
        <div key={label} style={{ display: "grid", gap: 4 }}>
          <span style={{ ...s.muted, fontSize: 12, fontWeight: 900 }}>{label}</span>
          <span style={{ fontWeight: 900, fontSize: 15 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function defaultsFromPartner(partners, client, workType) {
  const fromClient = getCostStructureForClient(partners, client, workType);
  return {
    material: fromClient.material,
    pasteLabor: fromClient.pasteLabor,
    substrate: fromClient.substrate,
    auxiliary: fromClient.auxiliary,
    waste: fromClient.waste,
    outsourcingMode: fromClient.standardOutsourcingMode === "sqm" ? "sqm" : "labor",
    laborUnitPrice: fromClient.standardLaborUnitPrice,
    outsourcingSqmUnitPrice: fromClient.standardOutsourcingSqmUnitPrice,
    targetProfitRate: fromClient.standardTargetProfitRate,
  };
}

export default function SiteMasterManager({ siteMasters, partners, onBack, onSave }) {
  const partnerOptions = partners.map((partner) => partner.name);
  const [form, setForm] = useState(() => emptySiteMasterForm(partners));
  const skipSelectionLoad = useRef(true);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (partnerOptions.length === 0) return;
    if (!partnerOptions.includes(form.client)) {
      setForm((prev) => ({ ...prev, client: partnerOptions[0] }));
    }
  }, [partnerOptions, form.client]);

  useEffect(() => {
    if (!form.client || !form.workType) return;
    if (skipSelectionLoad.current) {
      skipSelectionLoad.current = false;
      return;
    }

    const existing = findSiteMaster(siteMasters, form.client, form.workType);
    if (existing) {
      setForm(normalizeSiteMaster({ ...existing }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      ...defaultsFromPartner(partners, form.client, form.workType),
    }));
  }, [form.client, form.workType, siteMasters, partners]);

  const handleSave = () => {
    if (!form.client) {
      alert("取引先を選択してください。");
      return;
    }
    const normalized = normalizeSiteMaster(form);
    const existing = findSiteMaster(siteMasters, normalized.client, normalized.workType);
    if (existing) {
      onSave(
        siteMasters.map((item) =>
          item.id === existing.id ? { ...normalized, id: existing.id } : item
        )
      );
      return;
    }
    onSave([...siteMasters, { ...normalized, id: Date.now() }]);
  };

  const handleDelete = (master) => {
    if (!window.confirm(`${master.client} / ${master.workType} の設定を削除しますか？`)) {
      return;
    }
    onSave(siteMasters.filter((item) => item.id !== master.id));
    if (form.client === master.client && form.workType === master.workType) {
      skipSelectionLoad.current = true;
      setForm({
        ...emptySiteMasterForm(partners),
        client: master.client,
        workType: master.workType,
        ...defaultsFromPartner(partners, master.client, master.workType),
      });
    }
  };

  const handleEdit = (master) => {
    skipSelectionLoad.current = true;
    setForm(normalizeSiteMaster({ ...master }));
  };

  const sortedMasters = [...siteMasters].sort((a, b) => {
    const clientCompare = a.client.localeCompare(b.client, "ja");
    if (clientCompare !== 0) return clientCompare;
    return WORK_TYPES.indexOf(a.workType) - WORK_TYPES.indexOf(b.workType);
  });

  if (partnerOptions.length === 0) {
    return (
      <main style={s.page}>
        <button type="button" style={s.back} onClick={onBack}>← 戻る</button>
        <h1 style={s.title}>現場マスター</h1>
        <p style={s.muted}>取引先を先に登録してください。</p>
      </main>
    );
  }

  const currentMaster = findSiteMaster(siteMasters, form.client, form.workType);

  return (
    <main style={s.page}>
      <button type="button" style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>現場マスター</h1>
      <p style={s.sub}>取引先 → 工事項目 → 設定。見積では2つ選ぶだけで自動入力されます。</p>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>設定を編集</h2>
        <div style={s.form}>
          <Select
            label="取引先"
            value={form.client}
            setValue={(v) => setField("client", v)}
            options={partnerOptions}
          />
          <Select
            label="工事項目"
            value={form.workType}
            setValue={(v) => setField("workType", v)}
            options={WORK_TYPES}
          />
          <SiteMasterSettingsForm form={form} setField={setField} />
        </div>
        <button type="button" style={s.save} onClick={handleSave}>
          {currentMaster ? "設定を更新" : "設定を保存"}
        </button>
      </section>

      {sortedMasters.length === 0 ? (
        <p style={{ ...s.muted, marginTop: 20 }}>登録済みの設定がありません。</p>
      ) : (
        sortedMasters.map((master) => (
          <section key={master.id} style={s.listCard}>
            <h2 style={{ ...s.sectionTitle, marginBottom: 8 }}>{master.client}</h2>
            <p style={s.listMeta}>{master.workType}</p>
            <SiteMasterSummary master={master} />
            <div style={{ ...s.rowActions, marginTop: 16 }}>
              <button type="button" style={s.editBtn} onClick={() => handleEdit(master)}>
                編集
              </button>
              <button type="button" style={s.delete} onClick={() => handleDelete(master)}>
                削除
              </button>
            </div>
          </section>
        ))
      )}
    </main>
  );
}

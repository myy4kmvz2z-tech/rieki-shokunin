"use client";

import { useEffect, useRef, useState } from "react";
import { WORK_TYPES } from "../lib/constants";
import { emptyTemplateForm, normalizeTemplate } from "../lib/estimateTemplate";
import { getCostStructureForClient, getOutsourcingModeLabel, yen } from "../utils/calcProfit";
import { s } from "../lib/styles";
import { CardButtonGroup, Input, Select } from "./FormFields";

const OUTSOURCING_MODE_OPTIONS = [
  { value: "labor", label: "常用（人工）", icon: "👷" },
  { value: "sqm", label: "請負（㎡）", icon: "📐" },
];

function TemplateSettingsForm({ form, onFormChange, clients, skipClientSyncRef }) {
  const clientOptions = clients.map((c) => c.name);
  const setField = (key, value) => {
    onFormChange((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!clientOptions.length) return;
    if (!clientOptions.includes(form.client) && clientOptions[0]) {
      onFormChange((prev) => ({ ...prev, client: clientOptions[0] }));
      return;
    }
    if (skipClientSyncRef.current) {
      skipClientSyncRef.current = false;
      return;
    }

    const fromClient = getCostStructureForClient(clients, form.client, form.workType);
    onFormChange((prev) => ({
      ...prev,
      material: fromClient.material,
      pasteLabor: fromClient.pasteLabor,
      substrate: fromClient.substrate,
      auxiliary: fromClient.auxiliary,
      waste: fromClient.waste,
      outsourcingMode: fromClient.standardOutsourcingMode === "sqm" ? "sqm" : "labor",
      laborUnitPrice: fromClient.standardLaborUnitPrice,
      outsourcingSqmUnitPrice: fromClient.standardOutsourcingSqmUnitPrice,
      targetProfitRate: fromClient.standardTargetProfitRate,
    }));
  }, [clients, form.client, form.workType, clientOptions, onFormChange, skipClientSyncRef]);

  if (clientOptions.length === 0) {
    return <p style={s.muted}>元請を先に登録してください。</p>;
  }

  return (
    <>
      <Input label="テンプレート名" value={form.name} setValue={(v) => setField("name", v)} />
      <Select
        label="元請"
        value={form.client}
        setValue={(v) => setField("client", v)}
        options={clientOptions}
      />
      <Select
        label="工事項目"
        value={form.workType}
        setValue={(v) => setField("workType", v)}
        options={WORK_TYPES}
      />
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
        label="標準常用単価 円/人工"
        value={form.laborUnitPrice}
        setValue={(v) => setField("laborUnitPrice", v)}
        type="number"
      />
      <Input
        label="標準請負単価 円/㎡"
        value={form.outsourcingSqmUnitPrice}
        setValue={(v) => setField("outsourcingSqmUnitPrice", v)}
        type="number"
      />
      <Input
        label="標準利益率 %"
        value={form.targetProfitRate}
        setValue={(v) => setField("targetProfitRate", v)}
        type="number"
      />
    </>
  );
}

function TemplateFieldList({ template }) {
  const rows = [
    { label: "元請", value: template.client },
    { label: "工事項目", value: template.workType },
    { label: "材料費", value: `${yen(template.material)}/㎡` },
    { label: "貼り手間", value: `${yen(template.pasteLabor)}/㎡` },
    { label: "下地処理", value: `${yen(template.substrate)}/㎡` },
    { label: "副資材", value: `${yen(template.auxiliary)}/㎡` },
    { label: "廃材処分", value: `${yen(template.waste)}/㎡` },
    { label: "外注方式", value: getOutsourcingModeLabel(template.outsourcingMode) },
    { label: "標準常用単価", value: `${yen(template.laborUnitPrice)}/人工` },
    { label: "標準請負単価", value: `${yen(template.outsourcingSqmUnitPrice)}/㎡` },
    { label: "標準利益率", value: `${Number(template.targetProfitRate || 0)}%` },
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

export default function TemplateManager({
  templates,
  clients,
  onBack,
  onSave,
  onUseTemplate,
}) {
  const [form, setForm] = useState(() => emptyTemplateForm(clients));
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(() => emptyTemplateForm(clients));
  const [showAddForm, setShowAddForm] = useState(false);
  const addSkipSync = useRef(false);
  const editSkipSync = useRef(false);

  const validateName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("テンプレート名を入力してください。");
      return null;
    }
    return trimmed;
  };

  const handleAdd = () => {
    const name = validateName(form.name);
    if (!name) return;
    if (clients.length === 0) {
      alert("元請を先に登録してください。");
      return;
    }
    onSave([...templates, normalizeTemplate({ ...form, name, id: Date.now() })]);
    setForm(emptyTemplateForm(clients));
    addSkipSync.current = true;
    setShowAddForm(false);
  };

  const startEdit = (template) => {
    setEditingId(template.id);
    setEditForm(normalizeTemplate({ ...template }));
    editSkipSync.current = true;
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyTemplateForm(clients));
    editSkipSync.current = true;
  };

  const handleUpdate = () => {
    const name = validateName(editForm.name);
    if (!name) return;
    onSave(
      templates.map((item) =>
        item.id === editingId
          ? normalizeTemplate({ ...editForm, name, id: editingId })
          : item
      )
    );
    cancelEdit();
  };

  const handleDelete = (template) => {
    if (!window.confirm(`「${template.name}」を削除しますか？`)) return;
    onSave(templates.filter((item) => item.id !== template.id));
    if (editingId === template.id) cancelEdit();
  };

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>見積テンプレート</h1>
      <p style={s.sub}>よく使う設定を保存して、30秒で見積を作成できます。</p>

      {!showAddForm ? (
        <button
          style={s.btnPrimary}
          type="button"
          onClick={() => {
            setForm(emptyTemplateForm(clients));
            addSkipSync.current = true;
            setShowAddForm(true);
          }}
          disabled={clients.length === 0}
        >
          ＋ テンプレート追加
        </button>
      ) : (
        <section style={s.listCard}>
          <h2 style={s.sectionTitle}>新規テンプレート</h2>
          <div style={s.form}>
            <TemplateSettingsForm
              form={form}
              onFormChange={setForm}
              clients={clients}
              skipClientSyncRef={addSkipSync}
            />
          </div>
          <div style={s.rowActions}>
            <button style={s.save} type="button" onClick={handleAdd}>追加</button>
            <button style={s.secondary} type="button" onClick={() => setShowAddForm(false)}>
              キャンセル
            </button>
          </div>
        </section>
      )}

      {templates.length === 0 ? (
        <p style={{ ...s.muted, marginTop: 20 }}>テンプレートがありません。</p>
      ) : (
        templates.map((template) => (
          <section key={template.id} style={s.listCard}>
            {editingId === template.id ? (
              <>
                <h2 style={s.sectionTitle}>{template.name}</h2>
                <div style={s.form}>
                  <TemplateSettingsForm
                    form={editForm}
                    onFormChange={setEditForm}
                    clients={clients}
                    skipClientSyncRef={editSkipSync}
                  />
                </div>
                <div style={s.rowActions}>
                  <button style={s.save} type="button" onClick={handleUpdate}>保存</button>
                  <button style={s.secondary} type="button" onClick={cancelEdit}>
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ ...s.sectionTitle, marginBottom: 16 }}>{template.name}</h2>
                <TemplateFieldList template={template} />
                <div style={{ ...s.rowActions, marginTop: 16 }}>
                  <button style={s.editBtn} type="button" onClick={() => onUseTemplate(template.id)}>
                    見積作成
                  </button>
                  <button style={s.copyBtn} type="button" onClick={() => startEdit(template)}>
                    編集
                  </button>
                  <button style={s.delete} type="button" onClick={() => handleDelete(template)}>
                    削除
                  </button>
                </div>
              </>
            )}
          </section>
        ))
      )}
    </main>
  );
}

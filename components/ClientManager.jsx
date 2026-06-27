"use client";

import { useState } from "react";
import {
  COST_UNIT_FIELDS,
  emptyClientForm,
  normalizeClient,
  OUTSOURCING_MODES,
  PRICE_FIELDS,
  PROFIT_SETTING_FIELDS,
} from "../lib/constants";
import { getOutsourcingModeLabel, yen } from "../utils/calcProfit";
import { s } from "../lib/styles";
import { Collapsible, Input, Select } from "./FormFields";

function ClientSettingsForm({ form, setField }) {
  return (
    <>
      <Input label="元請名" value={form.name} setValue={(v) => setField("name", v)} />

      <p style={s.formSection}>材料単価</p>
      <div style={s.twoColGrid}>
        {PRICE_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            setValue={(v) => setField(key, v)}
            type="number"
          />
        ))}
      </div>

      <p style={s.formSection}>原価設定</p>
      <div style={s.twoColGrid}>
        {COST_UNIT_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            setValue={(v) => setField(key, v)}
            type="number"
          />
        ))}
      </div>

      <Collapsible label="外注・利益設定">
        <Input
          label="標準常用単価 円/人工"
          value={form.standardLaborUnitPrice}
          setValue={(v) => setField("standardLaborUnitPrice", v)}
          type="number"
        />
        <Input
          label="標準請負単価 円/㎡"
          value={form.standardOutsourcingSqmUnitPrice}
          setValue={(v) => setField("standardOutsourcingSqmUnitPrice", v)}
          type="number"
        />
        <Select
          label="標準外注方式"
          value={form.standardOutsourcingMode}
          setValue={(v) => setField("standardOutsourcingMode", v)}
          options={OUTSOURCING_MODES}
        />
        {PROFIT_SETTING_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            setValue={(v) => setField(key, v)}
            type="number"
          />
        ))}
      </Collapsible>
    </>
  );
}

function ClientFieldList({ client }) {
  const rows = [
    ...PRICE_FIELDS.map(({ key, label }) => ({ label, value: yen(client[key]) })),
    ...COST_UNIT_FIELDS.map(({ key, label }) => ({ label, value: yen(client[key]) })),
    { label: "常用単価", value: yen(client.standardLaborUnitPrice) },
    { label: "請負単価", value: yen(client.standardOutsourcingSqmUnitPrice) },
    { label: "外注方式", value: getOutsourcingModeLabel(client.standardOutsourcingMode) },
    { label: "目標利益率", value: `${Number(client.standardTargetProfitRate || 0)}%` },
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

export default function ClientManager({ clients, onBack, onSave }) {
  const [form, setForm] = useState(emptyClientForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyClientForm());
  const [showAddForm, setShowAddForm] = useState(false);

  const updateForm = (setter) => (key, value) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const setFormField = updateForm(setForm);
  const setEditField = updateForm(setEditForm);

  const handleAdd = () => {
    const name = form.name.trim();
    if (!name) {
      alert("元請名を入力してください。");
      return;
    }
    if (clients.some((c) => c.name === name)) {
      alert("同じ名前の元請が既に登録されています。");
      return;
    }
    onSave([...clients, normalizeClient({ ...form, name, id: Date.now() })]);
    setForm(emptyClientForm());
    setShowAddForm(false);
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setEditForm(normalizeClient({ ...client }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyClientForm());
  };

  const handleUpdate = () => {
    const name = editForm.name.trim();
    if (!name) {
      alert("元請名を入力してください。");
      return;
    }
    if (clients.some((c) => c.name === name && c.id !== editingId)) {
      alert("同じ名前の元請が既に登録されています。");
      return;
    }
    onSave(
      clients.map((c) =>
        c.id === editingId
          ? normalizeClient({ ...editForm, name, id: editingId })
          : c
      )
    );
    cancelEdit();
  };

  const handleDelete = (client) => {
    if (!window.confirm(`「${client.name}」を削除しますか？`)) return;
    onSave(clients.filter((c) => c.id !== client.id));
    if (editingId === client.id) cancelEdit();
  };

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>元請管理</h1>

      {!showAddForm ? (
        <button style={s.btnPrimary} onClick={() => setShowAddForm(true)}>
          ＋ 元請を追加
        </button>
      ) : (
        <section style={s.listCard}>
          <h2 style={s.sectionTitle}>新規元請</h2>
          <div style={s.form}>
            <ClientSettingsForm form={form} setField={setFormField} />
          </div>
          <div style={s.rowActions}>
            <button style={s.save} onClick={handleAdd}>追加</button>
            <button style={s.secondary} onClick={() => setShowAddForm(false)}>キャンセル</button>
          </div>
        </section>
      )}

      {clients.length === 0 ? (
        <p style={{ ...s.muted, marginTop: 20 }}>まだ元請が未登録です。</p>
      ) : (
        clients.map((client) => (
          <section key={client.id} style={s.listCard}>
            {editingId === client.id ? (
              <>
                <h2 style={s.sectionTitle}>{client.name}</h2>
                <div style={s.form}>
                  <ClientSettingsForm form={editForm} setField={setEditField} />
                </div>
                <div style={s.rowActions}>
                  <button style={s.save} onClick={handleUpdate}>保存</button>
                  <button style={s.secondary} onClick={cancelEdit}>キャンセル</button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ ...s.sectionTitle, marginBottom: 16 }}>{client.name}</h2>
                <ClientFieldList client={client} />
                <div style={{ ...s.rowActions, marginTop: 16 }}>
                  <button style={s.editBtn} onClick={() => startEdit(client)}>編集</button>
                  <button style={s.delete} onClick={() => handleDelete(client)}>削除</button>
                </div>
              </>
            )}
          </section>
        ))
      )}
    </main>
  );
}

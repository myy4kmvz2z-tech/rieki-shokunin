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
import { Input, Select } from "./FormFields";

const outsourcingSubSection = {
  ...s.muted,
  margin: "8px 0 4px",
  fontSize: 12,
  fontWeight: 900,
};

function ClientSettingsForm({ form, setField }) {
  return (
    <>
      <Input label="元請名" value={form.name} setValue={(v) => setField("name", v)} />

      <p style={s.formSection}>材料単価</p>
      <div style={s.priceGrid}>
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
      <div style={s.priceGrid}>
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

      <p style={s.formSection}>外注設定</p>
      <p style={outsourcingSubSection}>① 常用単価（1人工）</p>
      <Input
        label="標準常用単価 円/人工"
        value={form.standardLaborUnitPrice}
        setValue={(v) => setField("standardLaborUnitPrice", v)}
        type="number"
      />
      <p style={outsourcingSubSection}>② 請負単価（㎡）</p>
      <Input
        label="標準請負単価 円/㎡"
        value={form.standardOutsourcingSqmUnitPrice}
        setValue={(v) => setField("standardOutsourcingSqmUnitPrice", v)}
        type="number"
      />
      <p style={outsourcingSubSection}>③ 標準外注方式</p>
      <Select
        label="標準外注方式"
        value={form.standardOutsourcingMode}
        setValue={(v) => setField("standardOutsourcingMode", v)}
        options={OUTSOURCING_MODES}
      />

      <p style={s.formSection}>利益設定</p>
      <div style={s.priceGrid}>
        {PROFIT_SETTING_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            setValue={(v) => setField(key, v)}
            type="number"
          />
        ))}
      </div>
    </>
  );
}

function ClientFieldList({ client }) {
  return (
    <>
      <p style={{ ...s.muted, margin: "0 0 8px", fontSize: 13, fontWeight: 900 }}>材料単価</p>
      <div style={s.priceList}>
        {PRICE_FIELDS.map(({ key, label }) => (
          <p key={key} style={s.priceRow}>
            <span style={s.muted}>{label}</span>
            <span>{yen(client[key])}</span>
          </p>
        ))}
      </div>

      <p style={{ ...s.muted, margin: "12px 0 8px", fontSize: 13, fontWeight: 900 }}>原価設定</p>
      <div style={s.priceList}>
        {COST_UNIT_FIELDS.map(({ key, label }) => (
          <p key={key} style={s.priceRow}>
            <span style={s.muted}>{label}</span>
            <span>{yen(client[key])}</span>
          </p>
        ))}
      </div>

      <p style={{ ...s.muted, margin: "12px 0 8px", fontSize: 13, fontWeight: 900 }}>外注設定</p>
      <div style={s.priceList}>
        <p style={s.priceRow}>
          <span style={s.muted}>① 標準常用単価 円/人工</span>
          <span>{yen(client.standardLaborUnitPrice)}</span>
        </p>
        <p style={s.priceRow}>
          <span style={s.muted}>② 標準請負単価 円/㎡</span>
          <span>{yen(client.standardOutsourcingSqmUnitPrice)}</span>
        </p>
        <p style={s.priceRow}>
          <span style={s.muted}>③ 標準外注方式</span>
          <span>{getOutsourcingModeLabel(client.standardOutsourcingMode)}</span>
        </p>
      </div>

      <p style={{ ...s.muted, margin: "12px 0 8px", fontSize: 13, fontWeight: 900 }}>利益設定</p>
      <div style={s.priceList}>
        {PROFIT_SETTING_FIELDS.map(({ key, label }) => (
          <p key={key} style={s.priceRow}>
            <span style={s.muted}>{label}</span>
            <span>
              {key === "standardTargetProfitRate"
                ? `${Number(client[key] || 0)}%`
                : yen(client[key])}
            </span>
          </p>
        ))}
      </div>
    </>
  );
}

export default function ClientManager({ clients, onBack, onSave }) {
  const [form, setForm] = useState(emptyClientForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyClientForm());

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
      <p style={s.sub}>元請ごとの単価・原価・外注・利益設定</p>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>新規元請</h2>
        <div style={s.form}>
          <ClientSettingsForm form={form} setField={setFormField} />
        </div>
        <button style={s.save} onClick={handleAdd}>追加する</button>
      </section>

      {clients.length === 0 ? (
        <p style={s.muted}>まだ元請が未登録です。</p>
      ) : (
        clients.map((client) => (
          <section key={client.id} style={s.listCard}>
            {editingId === client.id ? (
              <>
                <h2 style={s.sectionTitle}>編集</h2>
                <div style={s.form}>
                  <ClientSettingsForm form={editForm} setField={setEditField} />
                </div>
                <div style={s.rowActions}>
                  <button
                    style={{ ...s.save, width: "auto", flex: "1 1 120px", marginTop: 0 }}
                    onClick={handleUpdate}
                  >
                    保存
                  </button>
                  <button style={s.secondary} onClick={cancelEdit}>キャンセル</button>
                </div>
              </>
            ) : (
              <>
                <h2 style={s.sectionTitle}>{client.name}</h2>
                <ClientFieldList client={client} />
                <div style={s.rowActions}>
                  <button style={s.secondary} onClick={() => startEdit(client)}>編集</button>
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

"use client";

import { useState } from "react";
import {
  COST_UNIT_FIELDS,
  OUTSOURCING_MODES,
  OUTSOURCING_SETTING_FIELDS,
  PRICE_FIELDS,
  PROFIT_SETTING_FIELDS,
} from "../lib/constants";
import {
  emptyPartnerForm,
  normalizePartner,
  PARTNER_BILLING_FIELDS,
  PARTNER_COMPANY_FIELDS,
} from "../lib/partner";
import {
  canAddClient,
  getClientLimitMessage,
} from "../lib/plan";
import { getOutsourcingModeLabel, yen } from "../utils/calcProfit";
import { s } from "../lib/styles";
import ConfirmModal from "./ConfirmModal";
import SafeButton from "./SafeButton";
import UsageCard from "./UsageCard";
import { Collapsible, Input, Select } from "./FormFields";

function PartnerSettingsForm({ form, setField }) {
  return (
    <>
      <p style={s.formSection}>【会社情報】</p>
      {PARTNER_COMPANY_FIELDS.map(({ key, label, required }) => (
        <Input
          key={key}
          label={required ? `${label} *` : label}
          value={form[key]}
          setValue={(value) => setField(key, value)}
        />
      ))}

      <p style={s.formSection}>【請求情報】</p>
      {PARTNER_BILLING_FIELDS.map(({ key, label }) => (
        <Input
          key={key}
          label={label}
          value={form[key]}
          setValue={(value) => setField(key, value)}
        />
      ))}

      <p style={s.formSection}>【単価情報】</p>
      <p style={s.muted}>材料費（円/㎡）</p>
      <div style={s.twoColGrid}>
        {PRICE_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            setValue={(value) => setField(key, value)}
            type="number"
          />
        ))}
      </div>
      <div style={s.twoColGrid}>
        {COST_UNIT_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            setValue={(value) => setField(key, value)}
            type="number"
          />
        ))}
      </div>
      {OUTSOURCING_SETTING_FIELDS.map(({ key, label }) => (
        <Input
          key={key}
          label={label}
          value={form[key]}
          setValue={(value) => setField(key, value)}
          type="number"
        />
      ))}

      <Collapsible label="外注方式・目標利益率（見積の初期値）">
        <Select
          label="標準外注方式"
          value={form.standardOutsourcingMode}
          setValue={(value) => setField("standardOutsourcingMode", value)}
          options={OUTSOURCING_MODES}
        />
        {PROFIT_SETTING_FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
            value={form[key]}
            setValue={(value) => setField(key, value)}
            type="number"
          />
        ))}
      </Collapsible>
    </>
  );
}

function PartnerFieldList({ partner }) {
  const companyRows = PARTNER_COMPANY_FIELDS.map(({ key, label }) => ({
    label,
    value: partner[key],
  }));
  const billingRows = PARTNER_BILLING_FIELDS.map(({ key, label }) => ({
    label,
    value: partner[key],
  }));
  const pricingRows = [
    ...PRICE_FIELDS.map(({ key, label }) => ({ label, value: yen(partner[key]) })),
    ...COST_UNIT_FIELDS.map(({ key, label }) => ({ label, value: yen(partner[key]) })),
    { label: "常用単価", value: yen(partner.standardLaborUnitPrice) },
    { label: "請負単価", value: yen(partner.standardOutsourcingSqmUnitPrice) },
    { label: "外注方式", value: getOutsourcingModeLabel(partner.standardOutsourcingMode) },
    { label: "目標利益率", value: `${Number(partner.standardTargetProfitRate || 0)}%` },
  ];

  const renderRows = (rows) => (
    <div style={s.twoColGrid}>
      {rows
        .filter(({ value }) => value !== "" && value !== null && value !== undefined)
        .map(({ label, value }) => (
          <div key={label} style={{ display: "grid", gap: 4 }}>
            <span style={{ ...s.muted, fontSize: 12, fontWeight: 900 }}>{label}</span>
            <span style={{ fontWeight: 900, fontSize: 15, whiteSpace: "pre-wrap" }}>{value}</span>
          </div>
        ))}
    </div>
  );

  return (
    <>
      <p style={s.formSection}>【会社情報】</p>
      {renderRows(companyRows)}
      <p style={s.formSection}>【請求情報】</p>
      {renderRows(billingRows)}
      <p style={s.formSection}>【単価情報】</p>
      {renderRows(pricingRows)}
    </>
  );
}

function validatePartnerForm(form) {
  const name = form.name.trim();
  if (!name) {
    alert("会社名を入力してください。");
    return null;
  }
  return name;
}

export default function PartnerManager({ partners, plan, onBack, onSave, estimateCount = 0 }) {
  const [form, setForm] = useState(emptyPartnerForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyPartnerForm());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const setFormField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setEditField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = () => {
    const name = validatePartnerForm(form);
    if (!name) return;

    if (partners.some((partner) => partner.name === name)) {
      alert("同じ会社名の取引先が既に登録されています。");
      return;
    }
    if (!canAddClient(plan, partners.length)) {
      setShowLimitModal(true);
      return;
    }

    onSave([...partners, normalizePartner({ ...form, name, id: Date.now() })]);
    setForm(emptyPartnerForm());
    setShowAddForm(false);
  };

  const startEdit = (partner) => {
    setEditingId(partner.id);
    setEditForm(normalizePartner({ ...partner }));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyPartnerForm());
  };

  const handleUpdate = () => {
    const name = validatePartnerForm(editForm);
    if (!name) return;

    if (partners.some((partner) => partner.name === name && partner.id !== editingId)) {
      alert("同じ会社名の取引先が既に登録されています。");
      return;
    }

    onSave(
      partners.map((partner) =>
        partner.id === editingId
          ? normalizePartner({ ...editForm, name, id: editingId })
          : partner
      )
    );
    cancelEdit();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onSave(partners.filter((partner) => partner.id !== deleteTarget.id));
    if (editingId === deleteTarget.id) cancelEdit();
    setDeleteTarget(null);
  };

  return (
    <main style={s.page}>
      <SafeButton style={s.back} onPress={onBack}>
        ← 戻る
      </SafeButton>
      <h1 style={s.title}>取引先管理</h1>
      <p style={s.muted}>
        会社情報・請求情報・単価情報をまとめて管理します。見積・請求・送信で利用されます。
      </p>

      <UsageCard plan={plan} clientCount={partners.length} estimateCount={estimateCount} compact />

      {!showAddForm ? (
        <SafeButton style={s.btnPrimary} type="button" onPress={() => setShowAddForm(true)}>
          ＋ 取引先を追加
        </SafeButton>
      ) : (
        <section style={s.listCard}>
          <h2 style={s.sectionTitle}>新規取引先</h2>
          <div style={s.form}>
            <PartnerSettingsForm form={form} setField={setFormField} />
          </div>
            <div style={s.rowActions}>
              <SafeButton style={s.save} type="button" onPress={handleAdd}>
                追加
              </SafeButton>
              <SafeButton style={s.secondary} type="button" onPress={() => setShowAddForm(false)}>
                キャンセル
              </SafeButton>
            </div>
        </section>
      )}

      {partners.length === 0 ? (
        <p style={{ ...s.muted, marginTop: 20 }}>まだ取引先が未登録です。</p>
      ) : (
        partners.map((partner) => (
          <section key={partner.id} style={s.listCard}>
            {editingId === partner.id ? (
              <>
                <h2 style={s.sectionTitle}>{partner.name}</h2>
                <div style={s.form}>
                  <PartnerSettingsForm form={editForm} setField={setEditField} />
                </div>
                <div style={s.rowActions}>
                  <SafeButton style={s.save} type="button" onPress={handleUpdate}>
                    保存
                  </SafeButton>
                  <SafeButton style={s.secondary} type="button" onPress={cancelEdit}>
                    キャンセル
                  </SafeButton>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ ...s.sectionTitle, marginBottom: 16 }}>{partner.name}</h2>
                <PartnerFieldList partner={partner} />
                <div style={{ ...s.rowActions, marginTop: 16 }}>
                  <SafeButton style={s.editBtn} type="button" onPress={() => startEdit(partner)}>
                    編集
                  </SafeButton>
                  <SafeButton
                    style={s.delete}
                    type="button"
                    onPress={() => setDeleteTarget(partner)}
                  >
                    削除
                  </SafeButton>
                </div>
              </>
            )}
          </section>
        ))
      )}

      <ConfirmModal
        open={showLimitModal}
        message={getClientLimitMessage(plan)}
        confirmLabel="閉じる"
        alertOnly
        onConfirm={() => setShowLimitModal(false)}
        onCancel={() => setShowLimitModal(false)}
      />
      <ConfirmModal
        open={!!deleteTarget}
        message={deleteTarget ? `「${deleteTarget.name}」を削除しますか？` : ""}
        confirmLabel="削除"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}

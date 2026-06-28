"use client";

import { useState } from "react";
import { LABOR_COUNT_STEP, normalizeLaborCount } from "../utils/calcProfit";
import SafeButton from "./SafeButton";
import { s } from "../lib/styles";

function sanitizeLaborCountDraft(raw) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("").slice(0, 1)}`;
}

function parseLaborCountDraft(raw) {
  if (raw === "" || raw === ".") return 0;
  const n = Number(raw);
  return Number.isNaN(n) ? 0 : normalizeLaborCount(n);
}

export function LaborCountStepper({ label = "人工数", value, setValue, large = false }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const normalized = normalizeLaborCount(value);
  const labelStyle = large ? s.estimateLabel : s.label;

  const applyValue = (next) => {
    setValue(normalizeLaborCount(next));
  };

  const step = (delta) => {
    setValue((current) =>
      normalizeLaborCount(
        Math.max(0, normalizeLaborCount(current) + delta)
      )
    );
  };

  const displayValue = focused ? draft : normalized.toFixed(1);

  return (
    <div style={labelStyle}>
      <span>{label}</span>
      <div style={s.laborStepperRow}>
        <SafeButton
          type="button"
          style={s.laborStepperBtn}
          aria-label={`人工数を${LABOR_COUNT_STEP}減らす`}
          onPress={() => step(-LABOR_COUNT_STEP)}
        >
          −
        </SafeButton>
        <div style={s.laborStepperValueWrap}>
          <input
            style={s.laborStepperInput}
            type="text"
            inputMode="decimal"
            value={displayValue}
            aria-label={`${label}（0.5刻み）`}
            onFocus={() => {
              setFocused(true);
              setDraft(normalized === 0 ? "" : normalized.toFixed(1));
            }}
            onChange={(e) => {
              setDraft(sanitizeLaborCountDraft(e.target.value));
            }}
            onBlur={() => {
              setFocused(false);
              applyValue(parseLaborCountDraft(draft));
            }}
          />
          <span style={s.laborStepperSuffix}>人工</span>
        </div>
        <SafeButton
          type="button"
          style={s.laborStepperBtn}
          aria-label={`人工数を${LABOR_COUNT_STEP}増やす`}
          onPress={() => step(LABOR_COUNT_STEP)}
        >
          ＋
        </SafeButton>
      </div>
    </div>
  );
}

function sanitizeIntegerDraft(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return String(parseInt(digits, 10));
}

function parseIntegerValue(raw) {
  if (raw === "") return 0;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function Input({ label, value, setValue, type = "text", large = false }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const labelStyle = large ? s.estimateLabel : s.label;
  const inputStyle = large ? s.estimateInput : s.input;

  if (type !== "number") {
    return (
      <label style={labelStyle}>
        {label}
        <input
          style={inputStyle}
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
    );
  }

  const numericValue = Number(value || 0);
  const displayValue = focused ? draft : String(Number.isNaN(numericValue) ? 0 : numericValue);

  return (
    <label style={labelStyle}>
      {label}
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onFocus={() => {
          setFocused(true);
          setDraft(numericValue === 0 ? "" : String(numericValue));
        }}
        onChange={(e) => {
          const nextDraft = sanitizeIntegerDraft(e.target.value);
          setDraft(nextDraft);
          setValue(parseIntegerValue(nextDraft));
        }}
        onBlur={() => {
          setFocused(false);
          if (draft === "") {
            setValue(0);
          }
        }}
      />
    </label>
  );
}

export function CardButtonGroup({ label, value, setValue, options }) {
  return (
    <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
      {label && (
        <legend style={{ ...s.estimateFieldLabel, marginBottom: 12, padding: 0 }}>
          {label}
        </legend>
      )}
      <div style={s.cardButtonRow}>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const optionIcon = typeof option === "string" ? null : option.icon;
          const active = value === optionValue;
          return (
            <SafeButton
              key={optionValue}
              type="button"
              style={{
                ...s.cardButton,
                ...(active ? s.cardButtonActive : null),
              }}
              onPress={() => setValue(optionValue)}
            >
              {optionIcon && <span style={s.cardButtonIcon}>{optionIcon}</span>}
              <span>{optionLabel}</span>
            </SafeButton>
          );
        })}
      </div>
    </fieldset>
  );
}

export function RadioGroup({ label, value, setValue, options }) {
  return (
    <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
      {label && (
        <legend style={{ ...s.label, marginBottom: 10, padding: 0 }}>{label}</legend>
      )}
      <div style={s.radioGroup}>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const checked = value === optionValue;
          return (
            <label key={optionValue} style={s.radioOption}>
              <input
                type="radio"
                name={label || "radio-group"}
                value={optionValue}
                checked={checked}
                onChange={() => setValue(optionValue)}
              />
              <span>{optionLabel}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Select({ label, value, setValue, options, large = false }) {
  return (
    <label style={large ? s.estimateLabel : s.label}>
      {label}
      <select
        style={large ? s.estimateInput : s.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((o) => {
          const optionValue = typeof o === "string" ? o : o.value;
          const optionLabel = typeof o === "string" ? o : o.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export function Collapsible({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={s.details}>
      <SafeButton
        type="button"
        style={s.detailsSummary}
        aria-expanded={open}
        onPress={() => setOpen((value) => !value)}
      >
        {label}
      </SafeButton>
      {open && <div style={s.detailsBody}>{children}</div>}
    </div>
  );
}

export function ReadOnlyStat({ label, value, color }) {
  return (
    <div style={s.statItem}>
      <p style={s.resultLabel}>{label}</p>
      <p style={{ ...s.statValue, color: color || "#fff" }}>{value}</p>
    </div>
  );
}

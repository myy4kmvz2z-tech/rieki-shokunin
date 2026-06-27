"use client";

import { useState } from "react";
import { s } from "../lib/styles";

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

export function Input({ label, value, setValue, type = "text" }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  if (type !== "number") {
    return (
      <label style={s.label}>
        {label}
        <input
          style={s.input}
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
    <label style={s.label}>
      {label}
      <input
        style={s.input}
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

export function Select({ label, value, setValue, options }) {
  return (
    <label style={s.label}>
      {label}
      <select style={s.input} value={value} onChange={(e) => setValue(e.target.value)}>
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
  return (
    <details style={s.details}>
      <summary style={s.detailsSummary}>{label}</summary>
      <div style={s.detailsBody}>{children}</div>
    </details>
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

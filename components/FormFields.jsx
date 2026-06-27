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

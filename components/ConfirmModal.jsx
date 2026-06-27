"use client";

import { s } from "../lib/styles";

export default function ConfirmModal({
  open,
  message,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  alertOnly = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div style={s.modalOverlay} role="dialog" aria-modal="true">
      <div style={s.modalCard}>
        <p style={s.modalMessage}>{message}</p>
        <div style={alertOnly ? { display: "grid" } : s.modalActions}>
          {!alertOnly && (
            <button type="button" style={s.secondary} onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button type="button" style={s.save} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

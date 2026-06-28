"use client";

import SafeButton from "./SafeButton";
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
    <div className="modal-backdrop" style={s.modalOverlay} role="dialog" aria-modal="true">
      <div className="modal-card" style={s.modalCard}>
        <p style={s.modalMessage}>{message}</p>
        <div style={alertOnly ? { display: "grid" } : s.modalActions}>
          {!alertOnly && (
            <SafeButton type="button" style={s.secondary} onPress={onCancel}>
              {cancelLabel}
            </SafeButton>
          )}
          <SafeButton type="button" style={s.save} onPress={onConfirm}>
            {confirmLabel}
          </SafeButton>
        </div>
      </div>
    </div>
  );
}

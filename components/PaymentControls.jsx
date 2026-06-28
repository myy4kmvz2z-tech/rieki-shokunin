"use client";

import {
  getNextPaymentStatusLabel,
  getPaymentStatusLabel,
  isPaidStatus,
  normalizePaymentStatus,
  PAYMENT_FLOW,
} from "../lib/payment";
import SafeButton from "./SafeButton";
import { s } from "../lib/styles";

export default function PaymentControls({
  paymentStatus,
  onAdvance,
  onMarkPaid,
}) {
  const current = normalizePaymentStatus(paymentStatus);
  const paid = isPaidStatus(current);
  const nextLabel = getNextPaymentStatusLabel(current);

  return (
    <div style={s.paymentBlock}>
      <p style={s.paymentBlockTitle}>入金管理</p>
      <div style={s.paymentFlow}>
        {PAYMENT_FLOW.map((step, index) => {
          const active = step.id === current;
          const done = PAYMENT_FLOW.findIndex((item) => item.id === current) > index;
          return (
            <span key={step.id}>
              {index > 0 && <span style={s.paymentArrow}>→</span>}
              <span
                style={{
                  ...s.paymentStep,
                  ...(active ? s.paymentStepActive : null),
                  ...(done ? s.paymentStepDone : null),
                }}
              >
                {step.label}
              </span>
            </span>
          );
        })}
      </div>
      <div style={s.paymentActions}>
        {!paid && nextLabel && (
          <SafeButton type="button" style={s.paymentAdvanceBtn} onPress={onAdvance}>
            → {nextLabel}
          </SafeButton>
        )}
        <SafeButton
          type="button"
          style={paid ? s.paymentPaidDone : s.paymentPaidBtn}
          onPress={onMarkPaid}
          disabled={paid}
        >
          {paid ? "☑ 入金済" : "□ 入金済"}
        </SafeButton>
      </div>
      <p style={s.paymentCurrent}>現在：{getPaymentStatusLabel(current)}</p>
    </div>
  );
}

"use client";

import { getPaymentStatusDisplay } from "../lib/payment";
import { s } from "../lib/styles";

export default function PaymentStatusBadge({ status }) {
  const display = getPaymentStatusDisplay(status);

  return (
    <p style={s.paymentStatusBadge}>
      <span aria-hidden="true">{display.icon}</span>
      {display.label}
    </p>
  );
}

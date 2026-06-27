"use client";

import { buildCeoComments } from "../utils/aiProfitDiagnosis";
import { hasProFeatures, PRO_PLAN_UPGRADE_MESSAGE } from "../lib/plan";
import { s } from "../lib/styles";

export default function CeoCommentCard({ estimates, plan, dashboard }) {
  const pro = hasProFeatures(plan);
  const comments = pro
    ? buildCeoComments(estimates, {
        monthlyTargetProfit: dashboard?.monthlyTargetProfit,
        monthProfit: dashboard?.monthProfit,
      })
    : [];

  return (
    <section style={s.ceoDashSection}>
      <p style={s.ceoDashSectionTitle}>AI社長コメント</p>
      {pro ? (
        <ul style={s.ceoCommentList}>
          {comments.map((comment) => (
            <li key={comment} style={s.ceoCommentItem}>
              ・{comment}
            </li>
          ))}
        </ul>
      ) : (
        <p style={s.ceoCommentLocked}>{PRO_PLAN_UPGRADE_MESSAGE}</p>
      )}
    </section>
  );
}

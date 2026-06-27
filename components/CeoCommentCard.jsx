import { buildCeoComments } from "../utils/aiProfitDiagnosis";
import { hasProFeatures, PRO_PLAN_UPGRADE_MESSAGE } from "../lib/plan";
import { s } from "../lib/styles";

export default function CeoCommentCard({ estimates, plan }) {
  const pro = hasProFeatures(plan);
  const comments = pro ? buildCeoComments(estimates) : [];

  return (
    <section style={s.ceoCard}>
      <p style={s.usageTitle}>AI社長コメント</p>
      {pro ? (
        comments.map((comment) => (
          <p key={comment} style={s.ceoComment}>
            『{comment}』
          </p>
        ))
      ) : (
        <p style={s.ceoCommentLocked}>{PRO_PLAN_UPGRADE_MESSAGE}</p>
      )}
    </section>
  );
}

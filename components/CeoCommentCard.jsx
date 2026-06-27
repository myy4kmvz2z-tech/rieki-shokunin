import { buildCeoComments } from "../utils/aiProfitDiagnosis";
import { isProPlan } from "../lib/plan";
import { s } from "../lib/styles";

export default function CeoCommentCard({ estimates, plan }) {
  const pro = isProPlan(plan);
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
        <p style={s.ceoCommentLocked}>プロプランでAI社長コメントが利用できます。</p>
      )}
    </section>
  );
}

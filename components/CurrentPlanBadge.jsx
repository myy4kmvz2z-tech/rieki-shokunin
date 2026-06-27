import { getPlanShortLabel } from "../lib/plan";
import { s } from "../lib/styles";

export default function CurrentPlanBadge({ plan }) {
  return (
    <section style={s.currentPlanCard}>
      <p style={s.currentPlanLabel}>現在のプラン</p>
      <p style={s.currentPlanName}>{getPlanShortLabel(plan)}</p>
    </section>
  );
}

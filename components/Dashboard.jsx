import { buildDashboard, yen } from "../utils/calcProfit";
import CeoCommentCard from "./CeoCommentCard";
import UsageCard from "./UsageCard";
import { s } from "../lib/styles";

export default function Dashboard({ estimates, clients, plan }) {
  const stats = buildDashboard(estimates);

  return (
    <>
      <section style={s.card}>
        <p style={s.cardLabel}>今日の利益</p>
        <h2 style={s.cardValue}>{yen(stats.todayProfit)}</h2>
      </section>

      <div style={s.dashGrid}>
        <section style={s.miniCard}>
          <p style={s.miniLabel}>今月売上</p>
          <p style={s.miniCount}>{yen(stats.monthSales)}</p>
        </section>
        <section style={s.miniCard}>
          <p style={s.miniLabel}>利益率</p>
          <p style={s.miniCount}>{stats.profitRate.toFixed(1)}%</p>
        </section>
        <section style={{ ...s.miniCard, gridColumn: "1 / -1" }}>
          <p style={s.miniLabel}>保存済み見積</p>
          <p style={s.miniCount}>{stats.estimateCount}件</p>
        </section>
      </div>

      <CeoCommentCard estimates={estimates} plan={plan} />
      <UsageCard plan={plan} clientCount={clients.length} estimateCount={estimates.length} />
    </>
  );
}

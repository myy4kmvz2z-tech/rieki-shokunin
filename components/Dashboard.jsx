import { buildDashboard, yen } from "../utils/calcProfit";
import { s } from "../lib/styles";

export default function Dashboard({ estimates }) {
  const stats = buildDashboard(estimates);

  return (
    <>
      <section style={s.card}>
        <p style={s.cardLabel}>今日の利益</p>
        <h2 style={s.cardValue}>{yen(stats.todayProfit)}</h2>
        <p style={s.cardSub}>今月 {yen(stats.monthProfit)}</p>
      </section>

      <div style={s.dashGrid}>
        <section style={s.miniCard}>
          <p style={s.muted}>今月の売上</p>
          <p style={s.miniCount}>{yen(stats.monthSales)}</p>
        </section>
        <section style={s.miniCard}>
          <p style={s.muted}>今月の利益率</p>
          <p style={s.miniCount}>{stats.profitRate.toFixed(1)}%</p>
        </section>
        <section style={s.miniCard}>
          <p style={s.muted}>保存済み見積</p>
          <p style={s.miniCount}>{stats.estimateCount}件</p>
        </section>
      </div>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>元請別売上ランキング</h2>
        {stats.clientRanking.length === 0 ? (
          <p style={s.muted}>データがありません</p>
        ) : (
          stats.clientRanking.map((item, index) => (
            <p key={item.name} style={s.rankRow}>
              <span>
                {index + 1}. {item.name}
              </span>
              <span>{yen(item.sales)}</span>
            </p>
          ))
        )}
      </section>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>工事項目別売上</h2>
        {stats.workTypeBreakdown.map((item) => (
          <p key={item.name} style={s.rankRow}>
            <span>{item.name}</span>
            <span>{yen(item.sales)}</span>
          </p>
        ))}
      </section>
    </>
  );
}

"use client";

import { buildCeoDashboard } from "../utils/ceoDashboard";
import { yen } from "../utils/calcProfit";
import CeoCommentCard from "./CeoCommentCard";
import { s } from "../lib/styles";

function DashDivider() {
  return <hr style={s.ceoDashDivider} />;
}

function MetricRow({ label, value, accent = false }) {
  return (
    <div style={s.ceoMetricRow}>
      <span style={s.ceoMetricLabel}>{label}</span>
      <span style={accent ? s.ceoMetricValueAccent : s.ceoMetricValue}>{value}</span>
    </div>
  );
}

export default function Dashboard({
  estimates,
  plan,
  company,
  onNewEstimate,
  onList,
  onClients,
  onSettings,
  onPricing,
}) {
  const dashboard = buildCeoDashboard(estimates, {
    monthlyTargetProfit: company?.monthlyTargetProfit,
    dailyTargetProfit: company?.dailyTargetProfit,
  });

  return (
    <>
      <p style={s.ceoDashKicker}>AI社長ダッシュボード</p>

      <section style={s.ceoHeroCard}>
        <p style={s.ceoHeroLabel}>今月利益</p>
        <p style={s.ceoHeroValue}>{yen(dashboard.monthProfit)}</p>
      </section>

      <div style={s.ceoMetricGrid}>
        <section style={s.ceoMetricCard}>
          <p style={s.ceoMetricCardLabel}>今月売上</p>
          <p style={s.ceoMetricCardValue}>{yen(dashboard.monthSales)}</p>
        </section>
        <section style={s.ceoMetricCard}>
          <p style={s.ceoMetricCardLabel}>利益率</p>
          <p style={s.ceoMetricCardValue}>{dashboard.profitRate.toFixed(1)}%</p>
        </section>
      </div>

      <section style={s.ceoTargetCard}>
        <MetricRow label="今月目標" value={yen(dashboard.monthlyTargetProfit)} />
        <MetricRow label="あと" value={yen(dashboard.monthlyRemaining)} accent />
      </section>

      <DashDivider />

      <CeoCommentCard estimates={estimates} plan={plan} dashboard={dashboard} />

      <DashDivider />

      <section style={s.ceoDashSection}>
        <div style={s.ceoMetricGrid}>
          <section style={s.ceoMetricCard}>
            <p style={s.ceoMetricCardLabel}>今日利益</p>
            <p style={s.ceoMetricCardValue}>{yen(dashboard.todayProfit)}</p>
          </section>
          <section style={s.ceoMetricCard}>
            <p style={s.ceoMetricCardLabel}>今日売上</p>
            <p style={s.ceoMetricCardValue}>{yen(dashboard.todaySales)}</p>
          </section>
        </div>
        <section style={{ ...s.ceoMetricCard, marginTop: 12 }}>
          <p style={s.ceoMetricCardLabel}>今日利益率</p>
          <p style={s.ceoMetricCardValue}>{dashboard.todayProfitRate.toFixed(1)}%</p>
        </section>
      </section>

      <section style={s.ceoTargetCard}>
        <MetricRow label="今日目標利益" value={yen(dashboard.dailyTargetProfit)} />
        <MetricRow label="あと" value={yen(dashboard.dailyRemaining)} accent />
        <MetricRow label="年間利益予測" value={yen(dashboard.annualProfitForecast)} />
      </section>

      <DashDivider />

      <section style={s.ceoDashSection}>
        <p style={s.ceoDashSectionTitle}>元請ランキング</p>
        {dashboard.clientRanking.length === 0 ? (
          <p style={s.ceoEmptyText}>今月のデータがありません</p>
        ) : (
          <ol style={s.ceoRankList}>
            {dashboard.clientRanking.map((item, index) => (
              <li key={item.name} style={s.ceoRankItem}>
                <span style={s.ceoRankPlace}>{index + 1}位</span>
                <span style={s.ceoRankName}>{item.name}</span>
                <span style={s.ceoRankValue}>{yen(item.profit)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <DashDivider />

      <section style={s.ceoDashSection}>
        <p style={s.ceoDashSectionTitle}>工事項目ランキング</p>
        <ol style={s.ceoRankList}>
          {dashboard.workTypeRanking.map((item, index) => (
            <li key={item.name} style={s.ceoRankItem}>
              <span style={s.ceoRankPlace}>{index + 1}位</span>
              <span style={s.ceoRankName}>{item.shortName}</span>
              <span style={s.ceoRankValue}>{yen(item.profit)}</span>
            </li>
          ))}
        </ol>
      </section>

      <DashDivider />

      <section style={s.ceoDashSection}>
        <p style={s.ceoDashSectionTitle}>最近作成した見積</p>
        {dashboard.recentEstimates.length === 0 ? (
          <p style={s.ceoEmptyText}>まだ見積がありません</p>
        ) : (
          <div style={s.ceoRecentList}>
            {dashboard.recentEstimates.map((item) => (
              <article key={item.id} style={s.ceoRecentItem}>
                <p style={s.ceoRecentTitle}>{item.siteName}</p>
                <p style={s.ceoRecentMeta}>
                  {item.client} · {item.workType}
                </p>
                <div style={s.ceoRecentStats}>
                  <span>{item.profitLabel}</span>
                  <span>{item.rate.toFixed(1)}%</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <nav style={s.ceoNav}>
        <button style={s.btnPrimary} type="button" onClick={onNewEstimate}>
          ＋見積作成
        </button>
        <button style={s.btn} type="button" onClick={onList}>
          保存済み見積
        </button>
        <button style={s.btn} type="button" onClick={onClients}>
          元請管理
        </button>
        <button style={s.btn} type="button" onClick={onSettings}>
          会社設定
        </button>
        <button style={s.btn} type="button" onClick={onPricing}>
          料金プラン
        </button>
      </nav>
    </>
  );
}

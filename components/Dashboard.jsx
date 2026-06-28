"use client";

import { buildCeoDashboard } from "../utils/ceoDashboard";
import { yen } from "../utils/calcProfit";
import { getPlanShortLabel } from "../lib/plan";
import CeoCommentCard from "./CeoCommentCard";
import QuickEstimatePanel from "./QuickEstimatePanel";
import { s } from "../lib/styles";

function SectionDivider() {
  return <hr style={s.homeDivider} />;
}

function HomeMetric({ label, value, hero = false, accent = false }) {
  return (
    <section
      style={{
        ...(hero ? s.homeHeroCard : s.homeMetricCard),
        ...(accent ? s.homeMetricCardAccent : null),
      }}
    >
      <p style={hero ? s.homeHeroLabel : s.homeMetricLabel}>{label}</p>
      <p style={hero ? s.homeHeroValue : accent ? s.homeMetricValueAccent : s.homeMetricValue}>
        {value}
      </p>
    </section>
  );
}

export default function Dashboard({
  estimates,
  plan,
  company,
  siteMasters,
  quickEstimateUsage,
  onQuickEstimate,
  setScreen,
}) {
  const dashboard = buildCeoDashboard(estimates, {
    monthlyTargetProfit: company?.monthlyTargetProfit,
  });

  return (
    <>
      <header style={s.dashHeader}>
        <p style={s.dashBrand}>利益職人</p>
        <p style={s.dashPlanRow}>
          <span style={s.dashPlanLabel}>現在プラン</span>
          <span style={s.dashPlanName}>{getPlanShortLabel(plan)}</span>
        </p>
      </header>

      <SectionDivider />

      <HomeMetric label="今月利益" value={yen(dashboard.monthProfit)} hero />

      <div style={s.homeMetricStack}>
        <HomeMetric label="今月目標利益" value={yen(dashboard.monthlyTargetProfit)} />
        <HomeMetric
          label="あといくらで目標達成か"
          value={yen(dashboard.monthlyRemaining)}
          accent
        />
        <HomeMetric label="利益率" value={`${dashboard.profitRate.toFixed(1)}%`} />
        <HomeMetric label="今月売上" value={yen(dashboard.monthSales)} />
      </div>

      <SectionDivider />

      <div style={s.homeMetricStack}>
        <HomeMetric label="未請求金額" value={yen(dashboard.unbilledAmount)} />
        <HomeMetric label="入金待ち金額" value={yen(dashboard.pendingPaymentAmount)} />
      </div>

      <SectionDivider />

      <div style={s.homeMetricStack}>
        <HomeMetric
          label="今日の移動距離"
          value={`${dashboard.todayTravelDistanceKm.toFixed(1)} km`}
        />
        <HomeMetric
          label="今月移動距離"
          value={`${dashboard.monthTravelDistanceKm.toFixed(1)} km`}
        />
        <HomeMetric label="今月交通費" value={yen(dashboard.monthTransportCost)} accent />
      </div>

      <SectionDivider />

      <section style={s.homeSection}>
        <p style={s.homeSectionTitle}>📬 送信センター</p>
        <div style={s.homeStatusGrid}>
          <div style={s.homeStatusItem}>
            <p style={s.homeStatusLabel}>🟡 見積中</p>
            <p style={s.homeStatusValue}>{dashboard.statusCounts.estimate}件</p>
          </div>
          <div style={s.homeStatusItem}>
            <p style={s.homeStatusLabel}>🔵 送付済</p>
            <p style={s.homeStatusValue}>{dashboard.statusCounts.sent}件</p>
          </div>
          <div style={s.homeStatusItem}>
            <p style={s.homeStatusLabel}>🟣 請求済</p>
            <p style={s.homeStatusValue}>{dashboard.statusCounts.invoiced}件</p>
          </div>
          <div style={s.homeStatusItem}>
            <p style={s.homeStatusLabel}>🟠 入金待ち</p>
            <p style={s.homeStatusValue}>{dashboard.statusCounts.pending}件</p>
          </div>
          <div style={{ ...s.homeStatusItem, gridColumn: "1 / -1" }}>
            <p style={s.homeStatusLabel}>🟢 入金済</p>
            <p style={s.homeStatusValue}>{dashboard.statusCounts.paid}件</p>
          </div>
        </div>
      </section>

      <SectionDivider />

      <CeoCommentCard estimates={estimates} plan={plan} dashboard={dashboard} />

      <SectionDivider />

      <section style={s.homeSection}>
        <p style={s.homeSectionTitle}>🏆 取引先利益ランキング</p>
        {dashboard.clientRanking.length === 0 ? (
          <p style={s.ceoEmptyText}>ランキングデータがありません</p>
        ) : (
          <ol style={s.homeRankList}>
            {dashboard.clientRanking.map((item) => (
              <li key={item.name} style={s.homeRankItem}>
                <div style={s.homeRankMain}>
                  <span style={s.homeRankPlace}>{item.rankLabel}</span>
                  <span style={s.homeRankName}>{item.name}</span>
                </div>
                <p style={s.homeRankRate}>利益率 {item.profitRateLabel}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <SectionDivider />

      <QuickEstimatePanel
        siteMasters={siteMasters}
        usage={quickEstimateUsage}
        onQuickEstimate={onQuickEstimate}
      />

      <SectionDivider />

      <nav style={s.ceoNav}>
        <button
          type="button"
          style={s.btnPrimary}
          onClick={() => {
            console.log("CLICK");
            setScreen("new");
            alert("CLICK");
          }}
        >
          見積作成
        </button>
        <button type="button" style={s.btn} onClick={() => setScreen("siteMasters")}>
          現場マスター
        </button>
        <button type="button" style={s.btn} onClick={() => setScreen("list")}>
          保存済み見積
        </button>
        <button type="button" style={s.btn} onClick={() => setScreen("partners")}>
          取引先管理
        </button>
        <button type="button" style={s.btn} onClick={() => setScreen("settings")}>
          会社設定
        </button>
        <button type="button" style={s.btn} onClick={() => setScreen("pricing")}>
          料金プラン
        </button>
      </nav>
    </>
  );
}

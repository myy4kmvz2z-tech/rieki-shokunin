"use client";

import Link from "next/link";
import { buildQuickEstimateSections, getQuickWorkTypeLabel } from "../utils/quickEstimate";
import { s } from "../lib/styles";

export default function QuickEstimatePanel({ siteMasters, usage }) {
  const sections = buildQuickEstimateSections(siteMasters, usage);

  if (sections.length === 0) {
    return (
      <section style={s.homeSection}>
        <p style={s.homeSectionTitle}>【よく使う見積】</p>
        <p style={s.ceoEmptyText}>現場マスターを登録すると、ここからワンタップで見積を作成できます。</p>
      </section>
    );
  }

  return (
    <section style={s.homeSection}>
      <p style={s.homeSectionTitle}>⚡ よく使う見積</p>
      <div style={s.quickEstimateGroups}>
        {sections.map(({ client, items }) => (
          <div key={client} style={s.quickEstimateGroup}>
            <p style={s.quickEstimateClient}>🏠 {client}</p>
            <div style={s.quickEstimateItems}>
              {items.map((item) => (
                <Link
                  key={`${item.client}-${item.workType}`}
                  href={`/estimate?client=${encodeURIComponent(item.client)}&workType=${encodeURIComponent(item.workType)}`}
                  style={{ ...s.quickEstimateBtn, textDecoration: "none", display: "block" }}
                >
                  {getQuickWorkTypeLabel(item.workType)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

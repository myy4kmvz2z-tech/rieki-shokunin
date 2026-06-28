"use client";

import Dashboard from "../../components/Dashboard";
import { useCompany } from "../../hooks/useCompany";
import { useEstimates } from "../../hooks/useEstimates";
import { usePlan } from "../../hooks/usePlan";
import { useQuickEstimateUsage } from "../../hooks/useQuickEstimateUsage";
import { useSiteMasters } from "../../hooks/useSiteMasters";
import { s } from "../../lib/styles";

export default function DashboardPage() {
  const { estimates } = useEstimates();
  const { company } = useCompany();
  const { plan } = usePlan();
  const { siteMasters } = useSiteMasters();
  const { usage: quickEstimateUsage } = useQuickEstimateUsage();

  return (
    <main style={s.page}>
      <Dashboard
        estimates={estimates}
        plan={plan}
        company={company}
        siteMasters={siteMasters}
        quickEstimateUsage={quickEstimateUsage}
      />
    </main>
  );
}

"use client";

import PartnerManager from "../../components/PartnerManager";
import { useEstimates } from "../../hooks/useEstimates";
import { usePartners } from "../../hooks/usePartners";
import { usePlan } from "../../hooks/usePlan";

export default function PartnersPage() {
  const { partners, savePartners } = usePartners();
  const { estimates } = useEstimates();
  const { plan } = usePlan();

  return (
    <PartnerManager
      partners={partners}
      plan={plan}
      estimateCount={estimates.length}
      onSave={savePartners}
    />
  );
}

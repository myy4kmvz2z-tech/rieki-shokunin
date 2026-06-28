"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmModal from "../../components/ConfirmModal";
import EstimateForm from "../../components/EstimateForm";
import PrintLayer from "../../components/PrintLayer";
import { useCompany } from "../../hooks/useCompany";
import { useEstimates } from "../../hooks/useEstimates";
import { usePartners } from "../../hooks/usePartners";
import { usePdfExport } from "../../hooks/usePdfExport";
import { usePrintDocument } from "../../hooks/usePrintDocument";
import { usePlan } from "../../hooks/usePlan";
import { useQuickEstimateUsage } from "../../hooks/useQuickEstimateUsage";
import { useSiteMasters } from "../../hooks/useSiteMasters";
import { canSaveEstimate, getEstimateLimitMessage, getPdfUpgradeMessage, hasPdfFeatures } from "../../lib/plan";
import { withPaymentStatus } from "../../lib/payment";
import { findSiteMaster } from "../../lib/siteMaster";
import { siteMasterToQuickEstimateInitial } from "../../utils/quickEstimate";

function NewEstimateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = searchParams.get("client");
  const workType = searchParams.get("workType");
  const isQuickEstimate = Boolean(client && workType);

  const { estimates, saveAll } = useEstimates();
  const { partners } = usePartners();
  const { company } = useCompany();
  const { plan } = usePlan();
  const { siteMasters } = useSiteMasters();
  const { recordUsage } = useQuickEstimateUsage();
  const pdfExport = usePdfExport(company);
  const { printDoc, shouldPrint, requestPrint } = usePrintDocument();
  const [showEstimateLimitModal, setShowEstimateLimitModal] = useState(false);
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false);

  const master =
    isQuickEstimate && client && workType
      ? findSiteMaster(siteMasters, client, workType)
      : null;

  useEffect(() => {
    if (isQuickEstimate && client && workType) {
      recordUsage(client, workType);
    }
  }, [isQuickEstimate, client, workType, recordUsage]);

  const handleSave = (estimate) => {
    if (!canSaveEstimate(plan, estimates.length)) {
      setShowEstimateLimitModal(true);
      return;
    }
    saveAll([withPaymentStatus(estimate, estimate.paymentStatus), ...estimates]);
    router.push("/list");
  };

  const handlePrintDocument = (estimate, docType) => {
    if (!hasPdfFeatures(plan)) {
      setShowPdfUpgradeModal(true);
      return;
    }
    requestPrint({
      type: docType === "invoice" ? "invoice" : "estimate",
      estimate,
    });
  };

  if (isQuickEstimate && !master) {
    return (
      <main style={{ padding: 24 }}>
        <p>現場マスターが見つかりませんでした。</p>
      </main>
    );
  }

  return (
    <>
      <EstimateForm
        partners={partners}
        siteMasters={siteMasters}
        company={company}
        plan={plan}
        backHref="/dashboard"
        isQuickEstimate={isQuickEstimate}
        initialEstimate={master ? siteMasterToQuickEstimateInitial(master) : undefined}
        onSave={handleSave}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
      <ConfirmModal
        open={showEstimateLimitModal}
        message={getEstimateLimitMessage(plan)}
        confirmLabel="閉じる"
        alertOnly
        onConfirm={() => setShowEstimateLimitModal(false)}
        onCancel={() => setShowEstimateLimitModal(false)}
      />
      <ConfirmModal
        open={showPdfUpgradeModal}
        message={getPdfUpgradeMessage(plan)}
        confirmLabel="閉じる"
        alertOnly
        onConfirm={() => setShowPdfUpgradeModal(false)}
        onCancel={() => setShowPdfUpgradeModal(false)}
      />
      <PrintLayer printDoc={printDoc} shouldPrint={shouldPrint} company={company} />
    </>
  );
}

export default function NewEstimatePage() {
  return (
    <Suspense fallback={null}>
      <NewEstimateContent />
    </Suspense>
  );
}

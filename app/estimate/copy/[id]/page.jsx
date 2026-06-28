"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import BackLink from "../../../../components/BackLink";
import ConfirmModal from "../../../../components/ConfirmModal";
import EstimateForm from "../../../../components/EstimateForm";
import PrintLayer from "../../../../components/PrintLayer";
import { useCompany } from "../../../../hooks/useCompany";
import { useEstimates } from "../../../../hooks/useEstimates";
import { usePartners } from "../../../../hooks/usePartners";
import { usePdfExport } from "../../../../hooks/usePdfExport";
import { usePrintDocument } from "../../../../hooks/usePrintDocument";
import { usePlan } from "../../../../hooks/usePlan";
import { useSiteMasters } from "../../../../hooks/useSiteMasters";
import {
  canSaveEstimate,
  getEstimateLimitMessage,
  getPdfUpgradeMessage,
  hasPdfFeatures,
} from "../../../../lib/plan";
import { withPaymentStatus } from "../../../../lib/payment";
import { s } from "../../../../lib/styles";
import { prepareEstimateCopy } from "../../../../utils/estimateCopy";

export default function CopyEstimatePage() {
  const router = useRouter();
  const params = useParams();
  const estimateId = Number(params.id);

  const { estimates, saveAll } = useEstimates();
  const { partners } = usePartners();
  const { company } = useCompany();
  const { plan } = usePlan();
  const { siteMasters } = useSiteMasters();
  const pdfExport = usePdfExport(company);
  const { printDoc, shouldPrint, requestPrint } = usePrintDocument();
  const [showEstimateLimitModal, setShowEstimateLimitModal] = useState(false);
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false);

  const copySource = estimates.find((item) => item.id === estimateId);

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

  if (!copySource) {
    return (
      <main style={s.page}>
        <BackLink href="/list" />
        <p style={s.muted}>見積が見つかりませんでした。</p>
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
        backHref="/list"
        isCopy
        initialEstimate={prepareEstimateCopy(copySource)}
        onSave={(estimate) => {
          if (!canSaveEstimate(plan, estimates.length)) {
            setShowEstimateLimitModal(true);
            return;
          }
          saveAll([withPaymentStatus(estimate, estimate.paymentStatus), ...estimates]);
          router.push("/list");
        }}
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

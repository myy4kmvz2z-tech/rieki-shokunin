"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import BackLink from "../../../components/BackLink";
import ConfirmModal from "../../../components/ConfirmModal";
import EstimateForm from "../../../components/EstimateForm";
import PrintLayer from "../../../components/PrintLayer";
import { useCompany } from "../../../hooks/useCompany";
import { useEstimates } from "../../../hooks/useEstimates";
import { usePartners } from "../../../hooks/usePartners";
import { usePdfExport } from "../../../hooks/usePdfExport";
import { usePrintDocument } from "../../../hooks/usePrintDocument";
import { usePlan } from "../../../hooks/usePlan";
import { useSiteMasters } from "../../../hooks/useSiteMasters";
import { getPdfUpgradeMessage, hasPdfFeatures } from "../../../lib/plan";
import { s } from "../../../lib/styles";

export default function EditEstimatePage() {
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
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false);

  const editingEstimate = estimates.find((item) => item.id === estimateId);

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

  if (!editingEstimate) {
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
        initialEstimate={editingEstimate}
        onSave={(estimate) => {
          saveAll(estimates.map((item) => (item.id === estimate.id ? estimate : item)));
          router.push("/list");
        }}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
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

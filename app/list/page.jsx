"use client";

import { useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import EstimateList from "../../components/EstimateList";
import PrintLayer from "../../components/PrintLayer";
import { useCompany } from "../../hooks/useCompany";
import { useEstimates } from "../../hooks/useEstimates";
import { usePartners } from "../../hooks/usePartners";
import { usePdfExport } from "../../hooks/usePdfExport";
import { usePrintDocument } from "../../hooks/usePrintDocument";
import { usePlan } from "../../hooks/usePlan";
import { getPdfUpgradeMessage, hasPdfFeatures } from "../../lib/plan";
import {
  getNextPaymentStatus,
  PAYMENT_PAID,
} from "../../lib/payment";

export default function ListPage() {
  const { estimates, saveAll } = useEstimates();
  const { partners } = usePartners();
  const { company } = useCompany();
  const { plan } = usePlan();
  const pdfExport = usePdfExport(company);
  const { printDoc, shouldPrint, requestPrint } = usePrintDocument();
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false);

  const updateEstimate = (id, patch) => {
    saveAll(estimates.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleAdvancePayment = (id) => {
    const estimate = estimates.find((item) => item.id === id);
    if (!estimate) return;
    const next = getNextPaymentStatus(estimate.paymentStatus);
    if (next) updateEstimate(id, { paymentStatus: next });
  };

  const handleMarkPaid = (id) => {
    updateEstimate(id, { paymentStatus: PAYMENT_PAID });
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

  return (
    <>
      <EstimateList
        estimates={estimates}
        plan={plan}
        clientCount={partners.length}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
        onAdvancePayment={handleAdvancePayment}
        onMarkPaid={handleMarkPaid}
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

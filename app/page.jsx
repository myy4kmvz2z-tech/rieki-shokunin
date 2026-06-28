"use client";

import { useEffect, useState } from "react";
import PartnerManager from "../components/PartnerManager";
import CompanySettings from "../components/CompanySettings";
import ConfirmModal from "../components/ConfirmModal";
import Dashboard from "../components/Dashboard";
import EstimateForm from "../components/EstimateForm";
import EstimateList from "../components/EstimateList";
import PricingPlan from "../components/PricingPlan";
import PdfEstimate from "../components/PdfEstimate";
import PdfInvoice from "../components/PdfInvoice";
import { usePartners } from "../hooks/usePartners";
import { useCompany } from "../hooks/useCompany";
import { useEstimates } from "../hooks/useEstimates";
import { usePlan } from "../hooks/usePlan";
import { canSaveEstimate, getEstimateLimitMessage, getPdfUpgradeMessage, hasPdfFeatures } from "../lib/plan";
import {
  getNextPaymentStatus,
  PAYMENT_PAID,
  withPaymentStatus,
} from "../lib/payment";
import { s } from "../lib/styles";
import SiteMasterManager from "../components/SiteMasterManager";
import { useSiteMasters } from "../hooks/useSiteMasters";
import { useQuickEstimateUsage } from "../hooks/useQuickEstimateUsage";
import { findSiteMaster } from "../lib/siteMaster";
import { prepareEstimateCopy } from "../utils/estimateCopy";
import { siteMasterToQuickEstimateInitial } from "../utils/quickEstimate";
import { usePdfExport } from "../hooks/usePdfExport";
import { EstimatePaper, InvoicePaper } from "../utils/pdf";

export default function Page() {
  const [screen, setScreen] = useState("home");
  const { estimates, saveAll } = useEstimates();
  const { partners, savePartners } = usePartners();
  const { company, saveCompany } = useCompany();
  const { plan, setPlan } = usePlan();
  const { siteMasters, saveAll: saveSiteMasters } = useSiteMasters();
  const { usage: quickEstimateUsage, recordUsage } = useQuickEstimateUsage();
  const [printDoc, setPrintDoc] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copySourceId, setCopySourceId] = useState(null);
  const [quickEstimateTarget, setQuickEstimateTarget] = useState(null);
  const [showEstimateLimitModal, setShowEstimateLimitModal] = useState(false);
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false);
  const pdfExport = usePdfExport(company);

  useEffect(() => {
    const clearPrint = () => {
      setPrintDoc(null);
      setShouldPrint(false);
    };
    window.addEventListener("afterprint", clearPrint);
    return () => window.removeEventListener("afterprint", clearPrint);
  }, []);

  useEffect(() => {
    if (!printDoc || !shouldPrint) return;

    requestAnimationFrame(() => window.print());

    const fallbackTimer = window.setTimeout(() => {
      setPrintDoc(null);
      setShouldPrint(false);
    }, 4000);

    return () => window.clearTimeout(fallbackTimer);
  }, [printDoc, shouldPrint]);

  const handlePdfOutput = (estimate) => {
    if (!hasPdfFeatures(plan)) {
      setShowPdfUpgradeModal(true);
      return;
    }
    setPrintDoc({ type: "estimate", estimate });
    setShouldPrint(true);
  };

  const handleInvoicePdfOutput = (estimate) => {
    if (!hasPdfFeatures(plan)) {
      setShowPdfUpgradeModal(true);
      return;
    }
    setPrintDoc({ type: "invoice", estimate });
    setShouldPrint(true);
  };

  const saveNewEstimate = (estimate) => {
    saveAll([estimate, ...estimates]);
    setScreen("list");
  };

  const handleNewEstimateSave = (estimate) => {
    if (!canSaveEstimate(plan, estimates.length)) {
      setShowEstimateLimitModal(true);
      return;
    }
    saveNewEstimate(withPaymentStatus(estimate, estimate.paymentStatus));
  };

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
    if (docType === "invoice") {
      handleInvoicePdfOutput(estimate);
      return;
    }
    handlePdfOutput(estimate);
  };

  const handleQuickEstimate = (client, workType) => {
    recordUsage(client, workType);
    setQuickEstimateTarget({ client, workType });
    setScreen("quickEstimate");
  };

  let content;

  if (screen === "new") {
    content = (
      <EstimateForm
        partners={partners}
        siteMasters={siteMasters}
        company={company}
        plan={plan}
        onBack={() => setScreen("home")}
        onSave={handleNewEstimateSave}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
    );
  } else if (screen === "edit") {
    const editingEstimate = estimates.find((e) => e.id === editingId);
    content = editingEstimate ? (
      <EstimateForm
        partners={partners}
        siteMasters={siteMasters}
        company={company}
        plan={plan}
        initialEstimate={editingEstimate}
        onBack={() => {
          setEditingId(null);
          setScreen("list");
        }}
        onSave={(e) => {
          saveAll(estimates.map((item) => (item.id === e.id ? e : item)));
          setEditingId(null);
          setScreen("list");
        }}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
    ) : (
      <main style={s.page}>
        <button
          type="button"
          style={s.back}
          onClick={() => {
            setEditingId(null);
            setScreen("list");
          }}
        >
          ← 戻る
        </button>
        <p style={s.muted}>見積が見つかりませんでした。</p>
      </main>
    );
  } else if (screen === "copy") {
    const copySource = estimates.find((e) => e.id === copySourceId);
    content = copySource ? (
      <EstimateForm
        partners={partners}
        siteMasters={siteMasters}
        company={company}
        plan={plan}
        isCopy
        initialEstimate={prepareEstimateCopy(copySource)}
        onBack={() => {
          setCopySourceId(null);
          setScreen("list");
        }}
        onSave={(estimate) => {
          if (!canSaveEstimate(plan, estimates.length)) {
            setShowEstimateLimitModal(true);
            return;
          }
          saveNewEstimate(withPaymentStatus(estimate, estimate.paymentStatus));
          setCopySourceId(null);
        }}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
    ) : (
      <main style={s.page}>
        <button
          type="button"
          style={s.back}
          onClick={() => {
            setCopySourceId(null);
            setScreen("list");
          }}
        >
          ← 戻る
        </button>
        <p style={s.muted}>見積が見つかりませんでした。</p>
      </main>
    );
  } else if (screen === "quickEstimate") {
    const master = quickEstimateTarget
      ? findSiteMaster(siteMasters, quickEstimateTarget.client, quickEstimateTarget.workType)
      : null;
    content = master ? (
      <EstimateForm
        partners={partners}
        siteMasters={siteMasters}
        company={company}
        plan={plan}
        isQuickEstimate
        initialEstimate={siteMasterToQuickEstimateInitial(master)}
        onBack={() => {
          setQuickEstimateTarget(null);
          setScreen("home");
        }}
        onSave={(estimate) => {
          if (!canSaveEstimate(plan, estimates.length)) {
            setShowEstimateLimitModal(true);
            return;
          }
          saveNewEstimate(withPaymentStatus(estimate, estimate.paymentStatus));
          setQuickEstimateTarget(null);
        }}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
    ) : (
      <main style={s.page}>
        <button
          type="button"
          style={s.back}
          onClick={() => {
            setQuickEstimateTarget(null);
            setScreen("home");
          }}
        >
          ← 戻る
        </button>
        <p style={s.muted}>現場マスターが見つかりませんでした。</p>
      </main>
    );
  } else if (screen === "siteMasters") {
    content = (
      <SiteMasterManager
        siteMasters={siteMasters}
        partners={partners}
        onBack={() => setScreen("home")}
        onSave={saveSiteMasters}
      />
    );
  } else if (screen === "list") {
    content = (
      <EstimateList
        estimates={estimates}
        plan={plan}
        clientCount={partners.length}
        onBack={() => setScreen("home")}
        onEdit={(id) => {
          setEditingId(id);
          setScreen("edit");
        }}
        onCopy={(id) => {
          setCopySourceId(id);
          setScreen("copy");
        }}
        onGeneratePdf={pdfExport.generatePdf}
        isPdfGenerating={pdfExport.isGenerating}
        onPrintDocument={handlePrintDocument}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
        onAdvancePayment={handleAdvancePayment}
        onMarkPaid={handleMarkPaid}
      />
    );
  } else if (screen === "pdf") {
    content = (
      <PdfEstimate
        estimates={estimates}
        onBack={() => setScreen("home")}
        onPdf={handlePdfOutput}
      />
    );
  } else if (screen === "invoice") {
    content = (
      <PdfInvoice
        estimates={estimates}
        onBack={() => setScreen("home")}
        onPdf={handleInvoicePdfOutput}
      />
    );
  } else if (screen === "partners") {
    content = (
      <PartnerManager
        partners={partners}
        plan={plan}
        estimateCount={estimates.length}
        onBack={() => setScreen("home")}
        onSave={savePartners}
      />
    );
  } else if (screen === "settings") {
    content = (
      <CompanySettings
        company={company}
        onBack={() => setScreen("home")}
        onSave={saveCompany}
      />
    );
  } else if (screen === "pricing") {
    content = (
      <PricingPlan
        partners={partners}
        estimates={estimates}
        plan={plan}
        onSetPlan={setPlan}
        onBack={() => setScreen("home")}
      />
    );
  } else {
    content = (
      <main style={s.page}>
        <Dashboard
          estimates={estimates}
          plan={plan}
          company={company}
          siteMasters={siteMasters}
          quickEstimateUsage={quickEstimateUsage}
          onQuickEstimate={handleQuickEstimate}
          onNewEstimate={() => setScreen("new")}
          onSiteMasters={() => setScreen("siteMasters")}
          onList={() => setScreen("list")}
          onPartners={() => setScreen("partners")}
          onSettings={() => setScreen("settings")}
          onPricing={() => setScreen("pricing")}
        />
      </main>
    );
  }

  return (
    <>
      <div className="app-shell no-print">{content}</div>
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
      {printDoc && shouldPrint && (
        <div className="print-only" aria-hidden="true">
          <div className="paper">
            {printDoc.type === "invoice" ? (
              <InvoicePaper estimate={printDoc.estimate} company={company} />
            ) : (
              <EstimatePaper estimate={printDoc.estimate} company={company} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

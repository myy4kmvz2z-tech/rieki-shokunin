"use client";

import { useEffect, useState } from "react";
import ClientManager from "../components/ClientManager";
import CompanySettings from "../components/CompanySettings";
import ConfirmModal from "../components/ConfirmModal";
import Dashboard from "../components/Dashboard";
import EstimateForm from "../components/EstimateForm";
import EstimateList from "../components/EstimateList";
import PricingPlan from "../components/PricingPlan";
import PdfEstimate from "../components/PdfEstimate";
import PdfInvoice from "../components/PdfInvoice";
import { useClients } from "../hooks/useClients";
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
import { prepareEstimateCopy } from "../utils/estimateCopy";
import { EstimatePaper, InvoicePaper } from "../utils/pdf";

export default function Page() {
  const [screen, setScreen] = useState("home");
  const { estimates, saveAll } = useEstimates();
  const { clients, saveClients } = useClients();
  const { company, saveCompany } = useCompany();
  const { plan, setPlan } = usePlan();
  const [printDoc, setPrintDoc] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [copySourceId, setCopySourceId] = useState(null);
  const [showEstimateLimitModal, setShowEstimateLimitModal] = useState(false);
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false);

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

  let content;

  if (screen === "new") {
    content = (
      <EstimateForm
        clients={clients}
        company={company}
        plan={plan}
        onBack={() => setScreen("home")}
        onSave={handleNewEstimateSave}
        onPdf={handlePdfOutput}
        onInvoicePdf={handleInvoicePdfOutput}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
    );
  } else if (screen === "edit") {
    const editingEstimate = estimates.find((e) => e.id === editingId);
    content = editingEstimate ? (
      <EstimateForm
        clients={clients}
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
        onPdf={handlePdfOutput}
        onInvoicePdf={handleInvoicePdfOutput}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
    ) : (
      <main style={s.page}>
        <button
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
        clients={clients}
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
        onPdf={handlePdfOutput}
        onInvoicePdf={handleInvoicePdfOutput}
        onPdfBlocked={() => setShowPdfUpgradeModal(true)}
      />
    ) : (
      <main style={s.page}>
        <button
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
  } else if (screen === "list") {
    content = (
      <EstimateList
        estimates={estimates}
        plan={plan}
        clientCount={clients.length}
        onBack={() => setScreen("home")}
        onEdit={(id) => {
          setEditingId(id);
          setScreen("edit");
        }}
        onCopy={(id) => {
          setCopySourceId(id);
          setScreen("copy");
        }}
        onPdf={handlePdfOutput}
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
  } else if (screen === "clients") {
    content = (
      <ClientManager
        clients={clients}
        plan={plan}
        estimateCount={estimates.length}
        onBack={() => setScreen("home")}
        onSave={saveClients}
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
        clients={clients}
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
          onNewEstimate={() => setScreen("new")}
          onList={() => setScreen("list")}
          onClients={() => setScreen("clients")}
          onSettings={() => setScreen("settings")}
          onPricing={() => setScreen("pricing")}
        />
      </main>
    );
  }

  return (
    <>
      <div className="no-print">{content}</div>
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
      {printDoc && (
        <div className="paper">
          {printDoc.type === "invoice" ? (
            <InvoicePaper estimate={printDoc.estimate} company={company} />
          ) : (
            <EstimatePaper estimate={printDoc.estimate} company={company} />
          )}
        </div>
      )}
    </>
  );
}

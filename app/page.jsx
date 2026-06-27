"use client";

import { useEffect, useState } from "react";
import ClientManager from "../components/ClientManager";
import CompanySettings from "../components/CompanySettings";
import ConfirmModal from "../components/ConfirmModal";
import Dashboard from "../components/Dashboard";
import EstimateForm from "../components/EstimateForm";
import EstimateList from "../components/EstimateList";
import PdfEstimate from "../components/PdfEstimate";
import PdfInvoice from "../components/PdfInvoice";
import { useClients } from "../hooks/useClients";
import { useCompany } from "../hooks/useCompany";
import { useEstimates } from "../hooks/useEstimates";
import { ESTIMATE_BILLING_CONFIRM_MESSAGE, requiresEstimateBillingConfirm } from "../lib/billing";
import { s } from "../lib/styles";
import { EstimatePaper, InvoicePaper } from "../utils/pdf";

export default function Page() {
  const [screen, setScreen] = useState("home");
  const { estimates, saveAll } = useEstimates();
  const { clients, saveClients } = useClients();
  const { company, saveCompany } = useCompany();
  const [printDoc, setPrintDoc] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pendingEstimate, setPendingEstimate] = useState(null);
  const [showEstimateBillingModal, setShowEstimateBillingModal] = useState(false);

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
    setPrintDoc({ type: "estimate", estimate });
    setShouldPrint(true);
  };

  const handleInvoicePdfOutput = (estimate) => {
    setPrintDoc({ type: "invoice", estimate });
    setShouldPrint(true);
  };

  const saveNewEstimate = (estimate) => {
    saveAll([estimate, ...estimates]);
    setScreen("list");
  };

  const handleNewEstimateSave = (estimate) => {
    if (requiresEstimateBillingConfirm(estimates.length)) {
      setPendingEstimate(estimate);
      setShowEstimateBillingModal(true);
      return;
    }
    saveNewEstimate(estimate);
  };

  const confirmEstimateSave = () => {
    if (pendingEstimate) {
      saveNewEstimate(pendingEstimate);
    }
    setPendingEstimate(null);
    setShowEstimateBillingModal(false);
  };

  let content;

  if (screen === "new") {
    content = (
      <EstimateForm
        clients={clients}
        company={company}
        onBack={() => setScreen("home")}
        onSave={handleNewEstimateSave}
        onPdf={handlePdfOutput}
      />
    );
  } else if (screen === "edit") {
    const editingEstimate = estimates.find((e) => e.id === editingId);
    content = editingEstimate ? (
      <EstimateForm
        clients={clients}
        company={company}
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
  } else if (screen === "list") {
    content = (
      <EstimateList
        estimates={estimates}
        clientCount={clients.length}
        onBack={() => setScreen("home")}
        onEdit={(id) => {
          setEditingId(id);
          setScreen("edit");
        }}
        onPdf={handlePdfOutput}
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
  } else {
    content = (
      <main style={s.page}>
        <p style={s.kicker}>利益職人</p>
        <Dashboard estimates={estimates} clients={clients} />
        <nav style={s.menuGroup}>
          <button style={s.btnPrimary} onClick={() => setScreen("new")}>
            見積を作る
          </button>
          <button style={s.btn} onClick={() => setScreen("list")}>
            見積一覧
          </button>
          <button style={s.btn} onClick={() => setScreen("clients")}>
            元請管理
          </button>
          <button style={s.btn} onClick={() => setScreen("settings")}>
            会社設定
          </button>
        </nav>
      </main>
    );
  }

  return (
    <>
      <div className="no-print">{content}</div>
      <ConfirmModal
        open={showEstimateBillingModal}
        message={ESTIMATE_BILLING_CONFIRM_MESSAGE}
        confirmLabel="保存する"
        onConfirm={confirmEstimateSave}
        onCancel={() => {
          setPendingEstimate(null);
          setShowEstimateBillingModal(false);
        }}
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

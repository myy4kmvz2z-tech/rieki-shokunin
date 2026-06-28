"use client";

import CompanySettings from "../../components/CompanySettings";
import { useCompany } from "../../hooks/useCompany";

export default function SettingsPage() {
  const { company, saveCompany } = useCompany();

  return <CompanySettings company={company} onSave={saveCompany} />;
}

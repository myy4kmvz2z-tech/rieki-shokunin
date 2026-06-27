import { useEffect, useState } from "react";
import { DEFAULT_COMPANY, normalizeCompany } from "../lib/constants";

export function useCompany() {
  const [company, setCompany] = useState(DEFAULT_COMPANY);

  useEffect(() => {
    const savedCompany = localStorage.getItem("rieki-company");
    if (savedCompany) setCompany(normalizeCompany(JSON.parse(savedCompany)));
  }, []);

  const saveCompany = (next) => {
    const normalized = normalizeCompany(next);
    setCompany(normalized);
    localStorage.setItem("rieki-company", JSON.stringify(normalized));
  };

  return { company, saveCompany };
}

import { useEffect, useState } from "react";
import { getQuickEstimateKey } from "../utils/quickEstimate";

const STORAGE_KEY = "rieki-quick-estimate-usage";

export function useQuickEstimateUsage() {
  const [usage, setUsage] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setUsage(JSON.parse(saved));
  }, []);

  const recordUsage = (client, workType) => {
    const key = getQuickEstimateKey(client, workType);
    setUsage((prev) => {
      const next = { ...prev, [key]: (prev[key] || 0) + 1 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { usage, recordUsage };
}

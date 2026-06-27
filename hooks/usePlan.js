import { useEffect, useState } from "react";
import { DEFAULT_PLAN, normalizePlan } from "../lib/plan";

export function usePlan() {
  const [plan, setPlanState] = useState(DEFAULT_PLAN);

  useEffect(() => {
    const saved = localStorage.getItem("rieki-plan");
    if (saved) {
      const normalized = normalizePlan(saved);
      setPlanState(normalized);
      if (saved !== normalized) {
        localStorage.setItem("rieki-plan", normalized);
      }
    }
  }, []);

  const setPlan = (next) => {
    const normalized = normalizePlan(next);
    setPlanState(normalized);
    localStorage.setItem("rieki-plan", normalized);
  };

  return { plan, setPlan };
}

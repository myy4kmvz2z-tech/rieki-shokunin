import { useEffect, useState } from "react";
import { DEFAULT_PLAN, normalizePlan } from "../lib/plan";

export function usePlan() {
  const [plan, setPlanState] = useState(DEFAULT_PLAN);

  useEffect(() => {
    const saved = localStorage.getItem("rieki-plan");
    if (saved) setPlanState(normalizePlan(saved));
  }, []);

  const setPlan = (next) => {
    const normalized = normalizePlan(next);
    setPlanState(normalized);
    localStorage.setItem("rieki-plan", normalized);
  };

  return { plan, setPlan };
}

import { useEffect, useState } from "react";

export function useEstimates() {
  const [estimates, setEstimates] = useState([]);

  useEffect(() => {
    const savedEstimates = localStorage.getItem("rieki-estimates");
    if (savedEstimates) setEstimates(JSON.parse(savedEstimates));
  }, []);

  const saveAll = (next) => {
    setEstimates(next);
    localStorage.setItem("rieki-estimates", JSON.stringify(next));
  };

  return { estimates, saveAll };
}

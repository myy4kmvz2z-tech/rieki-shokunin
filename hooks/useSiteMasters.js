import { useEffect, useState } from "react";

const STORAGE_KEY = "rieki-site-masters";

export function useSiteMasters() {
  const [siteMasters, setSiteMasters] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSiteMasters(JSON.parse(saved));
  }, []);

  const saveAll = (next) => {
    setSiteMasters(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return { siteMasters, saveAll };
}

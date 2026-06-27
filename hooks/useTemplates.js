import { useEffect, useState } from "react";

const STORAGE_KEY = "rieki-templates";

export function useTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setTemplates(JSON.parse(saved));
  }, []);

  const saveAll = (next) => {
    setTemplates(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return { templates, saveAll };
}

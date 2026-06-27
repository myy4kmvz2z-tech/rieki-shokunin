import { useEffect, useState } from "react";

const STORAGE_KEY = "rieki-send-history";

export function useSendHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setHistory(JSON.parse(saved));
    } catch {
      setHistory([]);
    }
  }, []);

  const recordSend = (entry) => {
    const record = {
      id: Date.now(),
      sentAt: new Date().toLocaleString("ja-JP"),
      ...entry,
    };

    setHistory((prev) => {
      const next = [record, ...prev].slice(0, 200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    return record;
  };

  return { history, recordSend };
}

import { useEffect, useState } from "react";
import { DEFAULT_CLIENTS, normalizeClient } from "../lib/constants";

export function useClients() {
  const [clients, setClients] = useState(DEFAULT_CLIENTS.map(normalizeClient));

  useEffect(() => {
    const savedClients = localStorage.getItem("rieki-clients");
    if (savedClients) {
      const parsed = JSON.parse(savedClients);
      setClients(
        parsed.map((c, i) =>
          normalizeClient({
            ...c,
            id: c.id ?? Date.now() + i,
          })
        )
      );
    }
  }, []);

  const saveClients = (next) => {
    const normalized = next.map(normalizeClient);
    setClients(normalized);
    localStorage.setItem("rieki-clients", JSON.stringify(normalized));
  };

  return { clients, saveClients };
}

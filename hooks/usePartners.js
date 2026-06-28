import { useEffect, useState } from "react";
import {
  migratePartnersFromLegacyStorage,
  normalizePartner,
  PARTNER_STORAGE_KEY,
} from "../lib/partner";

export function usePartners() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    setPartners(migratePartnersFromLegacyStorage());
  }, []);

  const savePartners = (next) => {
    const normalized = next.map(normalizePartner);
    setPartners(normalized);
    localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(normalized));
  };

  return { partners, savePartners };
}

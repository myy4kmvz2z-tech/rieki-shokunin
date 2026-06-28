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
    const normalized = next.map((partner, index) =>
      normalizePartner({
        ...partner,
        id: partner.id ?? Date.now() + index,
      })
    );

    try {
      localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(normalized));
      setPartners(normalized);
      return true;
    } catch (error) {
      console.error("savePartners failed", error);
      alert("取引先の保存に失敗しました。ストレージの空き容量を確認してください。");
      return false;
    }
  };

  return { partners, savePartners };
}

import { findSiteMaster, siteMasterToSyncFields } from "../lib/siteMaster";
import { getCostStructureForClient } from "./calcProfit";

export function getEstimateSyncFromSiteMaster(clients, siteMasters, client, workType) {
  const master = findSiteMaster(siteMasters, client, workType);
  if (master) {
    const fromClient = getCostStructureForClient(clients, client, workType);
    return {
      ...siteMasterToSyncFields(master),
      fixedTransport: fromClient.transport,
    };
  }

  const fromClient = getCostStructureForClient(clients, client, workType);
  return {
    material: fromClient.material,
    pasteLabor: fromClient.pasteLabor,
    substrate: fromClient.substrate,
    auxiliary: fromClient.auxiliary,
    waste: fromClient.waste,
    outsourcingMode: fromClient.standardOutsourcingMode === "sqm" ? "sqm" : "labor",
    laborUnitPrice: fromClient.standardLaborUnitPrice,
    outsourcingSqmUnitPrice: fromClient.standardOutsourcingSqmUnitPrice,
    targetProfitRate: fromClient.standardTargetProfitRate,
    fixedTransport: fromClient.transport,
  };
}

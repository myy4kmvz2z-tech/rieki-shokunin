"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LABOR_UNIT_PRICE,
  DEFAULT_TARGET_PROFIT_RATE,
  OUTSOURCING_MODES,
  WORK_TYPES,
} from "../lib/constants";
import {
  calcEstimateTotals,
  calcProfitSimulator,
  getCostStructureForClient,
  getProfitRateColorBand,
  yen,
} from "../utils/calcProfit";
import { hasPdfFeatures, hasProFeatures } from "../lib/plan";
import AiProfitDiagnosis from "./AiProfitDiagnosis";
import {
  getInitialTransportState,
  TRANSPORT_MODES,
  TRIP_TYPES,
} from "../utils/calcTransport";
import { s } from "../lib/styles";
import { Collapsible, Input, ReadOnlyStat, Select } from "./FormFields";

function getStandardLaborUnitPrice(company, fromClient) {
  return Number(
    fromClient?.standardLaborUnitPrice ??
      company?.standardLaborUnitPrice ??
      DEFAULT_LABOR_UNIT_PRICE
  );
}

function getInitialOutsourcingState(initialEstimate, fromClient, company) {
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company, fromClient);
  const outsourcingMode =
    initialEstimate?.outsourcingMode === "sqm" || initialEstimate?.outsourcingMode === "labor"
      ? initialEstimate.outsourcingMode
      : fromClient?.standardOutsourcingMode === "sqm"
        ? "sqm"
        : "labor";
  const laborCount = Number(initialEstimate?.laborCount ?? 0);
  const laborUnitPrice = Number(
    initialEstimate?.laborUnitPrice ?? fromClient?.standardLaborUnitPrice ?? standardLaborUnitPrice
  );
  const outsourcingSqmUnitPrice = Number(
    initialEstimate?.outsourcingSqmUnitPrice ?? fromClient?.standardOutsourcingSqmUnitPrice ?? 0
  );
  const directLabor = Number(initialEstimate?.labor ?? 0);

  return {
    outsourcingMode,
    laborCount,
    laborUnitPrice,
    outsourcingSqmUnitPrice,
    directLabor,
  };
}

function getInitialCostState(
  clients,
  initialEstimate,
  defaultClient,
  defaultWorkType,
  company
) {
  const fromClient = getCostStructureForClient(clients, defaultClient, defaultWorkType);

  if (!initialEstimate) {
    return {
      material: fromClient.material,
      pasteLabor: fromClient.pasteLabor,
      substrate: fromClient.substrate,
      auxiliary: fromClient.auxiliary,
      waste: fromClient.waste,
      sellingUnitPrice: 0,
      discount: 0,
      targetProfitRate: fromClient.standardTargetProfitRate,
      desiredProfitAmount: 0,
      ...getInitialOutsourcingState(null, fromClient, company),
    };
  }

  const material =
    initialEstimate.material ??
    getCostStructureForClient(
      clients,
      initialEstimate.client ?? defaultClient,
      initialEstimate.workType ?? defaultWorkType
    ).material;

  const editClient = getCostStructureForClient(
    clients,
    initialEstimate.client ?? defaultClient,
    initialEstimate.workType ?? defaultWorkType
  );

  return {
    material,
    pasteLabor: initialEstimate.pasteLabor ?? 0,
    substrate: initialEstimate.substrate ?? 0,
    auxiliary: initialEstimate.auxiliary ?? 0,
    waste: initialEstimate.waste ?? 0,
    sellingUnitPrice: initialEstimate.unitPrice ?? 0,
    discount: initialEstimate.discount ?? 0,
    targetProfitRate:
      initialEstimate.targetProfitRate ?? editClient.standardTargetProfitRate,
    desiredProfitAmount: initialEstimate.desiredProfitAmount ?? 0,
    ...getInitialOutsourcingState(initialEstimate, editClient, company),
  };
}

function syncFromClient(fromClient) {
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

export default function EstimateForm({
  clients,
  company,
  plan,
  onBack,
  onSave,
  onPdf,
  onPdfBlocked,
  initialEstimate,
}) {
  const editing = !!initialEstimate;
  const defaultClient = clients[0]?.name || "";
  const defaultWorkType = initialEstimate?.workType ?? "クロス SP";
  const skipClientSync = useRef(editing);

  const initialCost = getInitialCostState(
    clients,
    initialEstimate,
    initialEstimate?.client ?? defaultClient,
    defaultWorkType,
    company
  );
  const initialTransport = getInitialTransportState(
    initialEstimate,
    getCostStructureForClient(
      clients,
      initialEstimate?.client ?? defaultClient,
      defaultWorkType
    ).transport
  );

  const [siteName, setSiteName] = useState(initialEstimate?.siteName ?? "");
  const [siteAddress, setSiteAddress] = useState(initialEstimate?.siteAddress ?? "");
  const [client, setClient] = useState(initialEstimate?.client ?? defaultClient);
  const [workType, setWorkType] = useState(defaultWorkType);
  const [area, setArea] = useState(initialEstimate?.area ?? 100);
  const [material, setMaterial] = useState(initialCost.material);
  const [pasteLabor, setPasteLabor] = useState(initialCost.pasteLabor);
  const [substrate, setSubstrate] = useState(initialCost.substrate);
  const [auxiliary, setAuxiliary] = useState(initialCost.auxiliary);
  const [waste, setWaste] = useState(initialCost.waste);
  const [sellingUnitPrice, setSellingUnitPrice] = useState(initialCost.sellingUnitPrice);
  const [discount, setDiscount] = useState(initialCost.discount);
  const [laborCount, setLaborCount] = useState(initialCost.laborCount);
  const [laborUnitPrice, setLaborUnitPrice] = useState(initialCost.laborUnitPrice);
  const [outsourcingMode, setOutsourcingMode] = useState(initialCost.outsourcingMode);
  const [outsourcingSqmUnitPrice, setOutsourcingSqmUnitPrice] = useState(
    initialCost.outsourcingSqmUnitPrice
  );
  const [directLabor, setDirectLabor] = useState(initialCost.directLabor);
  const [targetProfitRate, setTargetProfitRate] = useState(initialCost.targetProfitRate);
  const [desiredProfitAmount, setDesiredProfitAmount] = useState(initialCost.desiredProfitAmount);
  const [transportMode, setTransportMode] = useState(initialTransport.transportMode);
  const [distanceKm, setDistanceKm] = useState(initialTransport.distanceKm);
  const [tripType, setTripType] = useState(initialTransport.tripType);
  const [kmRate, setKmRate] = useState(initialTransport.kmRate);
  const [fixedTransport, setFixedTransport] = useState(initialTransport.fixedTransport);
  const [parkingFee, setParkingFee] = useState(initialTransport.parkingFee);

  useEffect(() => {
    if (!clients.some((c) => c.name === client) && clients[0]) {
      setClient(clients[0].name);
      return;
    }
    if (skipClientSync.current) {
      skipClientSync.current = false;
      return;
    }

    const fromClient = getCostStructureForClient(clients, client, workType);
    const synced = syncFromClient(fromClient);
    setMaterial(synced.material);
    setPasteLabor(synced.pasteLabor);
    setSubstrate(synced.substrate);
    setAuxiliary(synced.auxiliary);
    setWaste(synced.waste);
    setOutsourcingMode(synced.outsourcingMode);
    setLaborUnitPrice(synced.laborUnitPrice);
    setOutsourcingSqmUnitPrice(synced.outsourcingSqmUnitPrice);
    setTargetProfitRate(synced.targetProfitRate);
    if (transportMode === "fixed") {
      setFixedTransport(synced.fixedTransport);
    }
  }, [clients, client, workType, transportMode]);

  const clientOptions = clients.map((c) => c.name);
  const totals = calcEstimateTotals({
    area,
    material,
    pasteLabor,
    substrate,
    auxiliary,
    waste,
    sellingUnitPrice,
    discount,
    outsourcingMode,
    laborCount,
    laborUnitPrice,
    outsourcingSqmUnitPrice,
    labor: directLabor,
    transportMode,
    distanceKm,
    kmRate,
    tripType,
    fixedTransport,
    parkingFee,
  });
  const profitSimulator = calcProfitSimulator({
    totalCost: totals.cost,
    area,
    desiredProfitRate: targetProfitRate,
    desiredProfitAmount,
  });
  const profitRateBand = getProfitRateColorBand(totals.rate);
  const pro = hasProFeatures(plan);
  const pdfEnabled = hasPdfFeatures(plan);
  const showDirectLaborInput =
    (outsourcingMode === "labor" && Number(laborCount || 0) <= 0) ||
    (outsourcingMode === "sqm" && Number(outsourcingSqmUnitPrice || 0) <= 0);

  const buildEstimate = () => ({
    id: initialEstimate?.id ?? Date.now(),
    siteName: siteName || "名称未設定",
    siteAddress: siteAddress.trim(),
    client,
    workType,
    area,
    material,
    pasteLabor,
    substrate,
    auxiliary,
    waste,
    costUnitPrice: totals.costUnitPrice,
    discount: totals.discount,
    outsourcingMode: totals.outsourcingMode,
    laborCount: totals.laborCount,
    laborUnitPrice: totals.laborUnitPrice,
    outsourcingSqmUnitPrice: totals.outsourcingSqmUnitPrice,
    labor: totals.labor,
    targetProfitRate: Number(targetProfitRate || DEFAULT_TARGET_PROFIT_RATE),
    desiredProfitAmount: Number(desiredProfitAmount || 0),
    transportMode,
    distanceKm,
    tripType,
    kmRate,
    fixedTransport,
    parkingFee,
    transport: totals.transportCost,
    transportCost: totals.transportCost,
    unitPrice: sellingUnitPrice,
    sales: totals.sales,
    cost: totals.cost,
    profit: totals.profit,
    rate: totals.rate,
    createdAt: initialEstimate?.createdAt ?? new Date().toLocaleString("ja-JP"),
  });

  if (clientOptions.length === 0) {
    return (
      <main style={s.page}>
        <button style={s.back} onClick={onBack}>← 戻る</button>
        <h1 style={s.title}>見積作成</h1>
        <p style={s.muted}>元請が未登録です。元請管理から先に登録してください。</p>
      </main>
    );
  }

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>{editing ? "見積編集" : "見積作成"}</h1>

      <section style={s.blockSection}>
        <h2 style={s.blockTitle}>1. 現場</h2>
        <Input label="現場名" value={siteName} setValue={setSiteName} />
        <Select label="元請" value={client} setValue={setClient} options={clientOptions} />
        <Select label="工事項目" value={workType} setValue={setWorkType} options={WORK_TYPES} />
        <Input label="施工面積 ㎡" value={area} setValue={setArea} type="number" />
      </section>

      <section style={s.blockSection}>
        <h2 style={s.blockTitle}>2. 原価</h2>
        <Input label="材料費 円/㎡" value={material} setValue={setMaterial} type="number" />
        <Input label="下地処理 円/㎡" value={substrate} setValue={setSubstrate} type="number" />
        <Input label="副資材 円/㎡" value={auxiliary} setValue={setAuxiliary} type="number" />
        <Input label="廃材処分 円/㎡" value={waste} setValue={setWaste} type="number" />

        <div>
          <p style={s.resultLabel}>外注費</p>
          <p style={s.readOnlyValue}>{yen(totals.labor)}</p>
        </div>

        <div>
          <p style={s.resultLabel}>交通費</p>
          <p style={s.readOnlyValue}>{yen(totals.transportCost)}</p>
        </div>

        <Input label="駐車場代 円" value={parkingFee} setValue={setParkingFee} type="number" />

        <Collapsible label="外注費・交通費の設定">
          <Select
            label="外注費方式"
            value={outsourcingMode}
            setValue={setOutsourcingMode}
            options={OUTSOURCING_MODES}
          />
          {outsourcingMode === "labor" ? (
            <>
              <Input label="人工数" value={laborCount} setValue={setLaborCount} type="number" />
              <Input
                label="常用単価 円/人工"
                value={laborUnitPrice}
                setValue={setLaborUnitPrice}
                type="number"
              />
            </>
          ) : (
            <Input
              label="請負単価 円/㎡"
              value={outsourcingSqmUnitPrice}
              setValue={setOutsourcingSqmUnitPrice}
              type="number"
            />
          )}
          {showDirectLaborInput && (
            <Input
              label="外注費（直接入力） 円"
              value={directLabor}
              setValue={setDirectLabor}
              type="number"
            />
          )}
          <Select
            label="交通費方式"
            value={transportMode}
            setValue={setTransportMode}
            options={TRANSPORT_MODES}
          />
          {transportMode === "distance" ? (
            <>
              <Input label="距離 km" value={distanceKm} setValue={setDistanceKm} type="number" />
              <Select label="片道/往復" value={tripType} setValue={setTripType} options={TRIP_TYPES} />
              <Input label="1km単価 円/km" value={kmRate} setValue={setKmRate} type="number" />
            </>
          ) : (
            <Input label="交通費 円" value={fixedTransport} setValue={setFixedTransport} type="number" />
          )}
          <Input label="貼り手間 円/㎡" value={pasteLabor} setValue={setPasteLabor} type="number" />
          <Input label="現場住所（任意）" value={siteAddress} setValue={setSiteAddress} />
        </Collapsible>
      </section>

      <section style={s.blockSection}>
        <h2 style={s.blockTitle}>3. 売価</h2>
        <Input
          label="販売単価 円/㎡"
          value={sellingUnitPrice}
          setValue={setSellingUnitPrice}
          type="number"
        />
        <Input label="値引き 円" value={discount} setValue={setDiscount} type="number" />
        <Input
          label="目標利益率 %"
          value={targetProfitRate}
          setValue={setTargetProfitRate}
          type="number"
        />

        <Collapsible label="利益シミュレーター">
          <Input
            label="希望利益率 %"
            value={targetProfitRate}
            setValue={setTargetProfitRate}
            type="number"
          />
          <Input
            label="希望利益額 円"
            value={desiredProfitAmount}
            setValue={setDesiredProfitAmount}
            type="number"
          />
          <div style={s.result}>
            <p style={s.resultLabel}>原価合計</p>
            <p style={s.statValue}>{yen(profitSimulator.totalCost)}</p>
            <p style={{ ...s.resultLabel, marginTop: 12 }}>推奨販売単価</p>
            <p style={s.statValue}>
              {profitSimulator.canCalculate
                ? `${yen(profitSimulator.recommendedUnitPrice)}/㎡`
                : "—"}
            </p>
            {profitSimulator.message && (
              <p style={{ ...s.hint, marginTop: 12, color: "#ff8a00" }}>{profitSimulator.message}</p>
            )}
          </div>
          <button
            type="button"
            style={{ ...s.secondary, width: "100%" }}
            disabled={!profitSimulator.canCalculate}
            onClick={() => setSellingUnitPrice(profitSimulator.recommendedUnitPrice)}
          >
            推奨販売単価を販売単価へ反映
          </button>
        </Collapsible>
      </section>

      <section style={s.blockSection}>
        <h2 style={s.blockTitle}>4. 結果</h2>
        {pro ? (
          <>
            <div style={s.statGrid}>
              <ReadOnlyStat label="売上" value={yen(totals.sales)} />
              <ReadOnlyStat label="原価" value={yen(totals.cost)} />
              <ReadOnlyStat
                label="利益"
                value={yen(totals.profit)}
                color={totals.profit >= 0 ? "#fff" : "#ef4444"}
              />
              <ReadOnlyStat
                label="利益率"
                value={totals.sales > 0 ? `${Number(totals.rate || 0).toFixed(1)}%` : "—"}
                color={totals.sales > 0 ? profitRateBand.color : "#888"}
              />
            </div>
            <span style={s.proBadge}>プロプラン · AI利益診断</span>
            <AiProfitDiagnosis
              totals={{ ...totals, area }}
              targetProfitRate={targetProfitRate}
            />
          </>
        ) : (
          <>
            <ReadOnlyStat
              label="利益率"
              value={totals.sales > 0 ? `${Number(totals.rate || 0).toFixed(1)}%` : "—"}
              color={totals.sales > 0 ? profitRateBand.color : "#888"}
            />
            <p style={s.ceoCommentLocked}>プロプランでAI利益診断が利用できます。</p>
          </>
        )}
      </section>

      <div style={s.formActions}>
        <button style={s.save} onClick={() => onSave(buildEstimate())}>
          {editing ? "保存" : "保存する"}
        </button>
        <button
          style={{ ...s.pdf, opacity: pdfEnabled ? 1 : 0.5 }}
          onClick={() => {
            if (!pdfEnabled) {
              onPdfBlocked?.();
              return;
            }
            onPdf(buildEstimate());
          }}
        >
          印刷
        </button>
      </div>
    </main>
  );
}

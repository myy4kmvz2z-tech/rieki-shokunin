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
  formatCostDisplay,
  formatOutsourcingDisplay,
  formatSalesDisplay,
  getCostStructureForClient,
  getProfitRateColorBand,
  yen,
} from "../utils/calcProfit";
import {
  calcDistanceTransport,
  getInitialTransportState,
  TRANSPORT_MODES,
  TRIP_TYPES,
} from "../utils/calcTransport";
import { s } from "../lib/styles";
import { Input, Select } from "./FormFields";

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
  onBack,
  onSave,
  onPdf,
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
  const recommendedSellingUnitPrice = totals.recommendedSellingUnitPrice;
  const profitRateBand = getProfitRateColorBand(totals.rate);
  const distanceTransportPreview = calcDistanceTransport({ distanceKm, kmRate, tripType });
  const transportPreviewLabel =
    transportMode === "distance"
      ? `${distanceKm}km × ¥${kmRate}/km（${tripType === "roundTrip" ? "往復" : "片道"}）= ${yen(distanceTransportPreview)}`
      : `固定 ${yen(fixedTransport)}`;
  const outsourcingPreview = formatOutsourcingDisplay({
    outsourcingMode: totals.outsourcingMode,
    laborCount: totals.laborCount,
    laborUnitPrice: totals.laborUnitPrice,
    outsourcingSqmUnitPrice: totals.outsourcingSqmUnitPrice,
    area,
    labor: totals.labor,
  });
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

      <div style={s.form}>
        <Input label="現場名" value={siteName} setValue={setSiteName} />
        <Select label="元請" value={client} setValue={setClient} options={clientOptions} />
        <Input label="現場住所" value={siteAddress} setValue={setSiteAddress} />
        <Select label="工事項目" value={workType} setValue={setWorkType} options={WORK_TYPES} />
        <Input label="施工面積 ㎡" value={area} setValue={setArea} type="number" />
        <p style={s.hint}>元請を選ぶと外注方式・原価・目標利益率の標準値が自動入力されます</p>
      </div>

      <section style={s.blockSection}>
        <h2 style={s.blockTitle}>① 原価</h2>
        <Input label="材料費 円/㎡" value={material} setValue={setMaterial} type="number" />
        <Input label="貼り手間 円/㎡" value={pasteLabor} setValue={setPasteLabor} type="number" />
        <Input label="下地処理費用 円/㎡" value={substrate} setValue={setSubstrate} type="number" />
        <Input label="副資材 円/㎡" value={auxiliary} setValue={setAuxiliary} type="number" />
        <Input label="廃材処分費用 円/㎡" value={waste} setValue={setWaste} type="number" />

        <hr style={s.blockDivider} />

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
        <p style={s.hint}>{outsourcingPreview}</p>
        {showDirectLaborInput && (
          <Input
            label="外注費（直接入力） 円"
            value={directLabor}
            setValue={setDirectLabor}
            type="number"
          />
        )}

        <hr style={s.blockDivider} />

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
        <p style={s.hint}>交通費 {yen(totals.transportCost)}（{transportPreviewLabel}）</p>
        <Input label="駐車場代 円" value={parkingFee} setValue={setParkingFee} type="number" />
      </section>

      <section style={s.blockSection}>
        <h2 style={s.blockTitle}>② 売価</h2>
        <p style={s.hint}>推奨販売単価 {yen(recommendedSellingUnitPrice)}/㎡（原価単価 + 貼り手間）</p>
        <Input
          label="販売単価 円/㎡"
          value={sellingUnitPrice}
          setValue={setSellingUnitPrice}
          type="number"
        />
        <p style={s.hint}>未入力なら推奨販売単価で計算します</p>
        {totals.usesRecommendedSellingUnitPrice && (
          <p style={s.hint}>販売単価未入力のため、推奨販売単価を使用中</p>
        )}
        <button
          type="button"
          style={{ ...s.secondary, width: "100%" }}
          onClick={() => setSellingUnitPrice(recommendedSellingUnitPrice)}
        >
          推奨販売単価を販売単価に反映
        </button>
        <Input label="値引き 円" value={discount} setValue={setDiscount} type="number" />
        <Input
          label="目標利益率 %"
          value={targetProfitRate}
          setValue={setTargetProfitRate}
          type="number"
        />
      </section>

      <section style={s.blockSection}>
        <h2 style={s.blockTitle}>③ 結果</h2>

        <p style={s.resultLabel}>売上</p>
        <p style={s.resultDetail}>
          {formatSalesDisplay({
            area,
            effectiveSellingUnitPrice: totals.effectiveSellingUnitPrice,
            discount: totals.discount,
            sales: totals.sales,
          })}
        </p>

        <p style={s.resultLabel}>原価</p>
        <p style={s.resultDetail}>
          {formatCostDisplay({
            area,
            costUnitPrice: totals.costUnitPrice,
            outsourcingMode: totals.outsourcingMode,
            laborCount: totals.laborCount,
            laborUnitPrice: totals.laborUnitPrice,
            outsourcingSqmUnitPrice: totals.outsourcingSqmUnitPrice,
            labor: totals.labor,
            transportCost: totals.transportCost,
            parkingFee: totals.parkingFee,
            cost: totals.cost,
          })}
        </p>

        <p style={s.resultLabel}>利益</p>
        <p style={{ ...s.resultDetail, color: totals.profit >= 0 ? "#fff" : "#ef4444" }}>
          {yen(totals.profit)}
        </p>

        <p style={s.resultLabel}>利益率</p>
        <p
          style={{
            ...s.resultDetail,
            color: totals.sales > 0 ? profitRateBand.color : "#888",
            fontWeight: 900,
          }}
        >
          {totals.sales > 0
            ? `${profitRateBand.icon} ${Number(totals.rate || 0).toFixed(1)}%（${profitRateBand.label}）`
            : "—（売上が0のため計算不可）"}
        </p>
      </section>

      <div style={s.formActions}>
        <button style={s.pdf} onClick={() => onPdf(buildEstimate())}>
          見積書を印刷
        </button>
        <button style={s.save} onClick={() => onSave(buildEstimate())}>
          {editing ? "上書き保存" : "保存する"}
        </button>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_LABOR_UNIT_PRICE, OUTSOURCING_MODES, WORK_TYPES } from "../lib/constants";
import {
  calcEstimateTotals,
  DEFAULT_TARGET_PROFIT_RATE,
  formatCostDisplay,
  formatOutsourcingDisplay,
  formatProfitRateJudgment,
  formatSalesDisplay,
  getCostStructureForClient,
  getProfitRateJudgment,
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

function getStandardLaborUnitPrice(company) {
  return Number(company?.standardLaborUnitPrice ?? DEFAULT_LABOR_UNIT_PRICE);
}

function getInitialOutsourcingState(initialEstimate, standardLaborUnitPrice) {
  const outsourcingMode = initialEstimate?.outsourcingMode === "sqm" ? "sqm" : "labor";
  const laborCount = Number(initialEstimate?.laborCount ?? 0);
  const laborUnitPrice = Number(
    initialEstimate?.laborUnitPrice ?? standardLaborUnitPrice
  );
  const outsourcingSqmUnitPrice = Number(initialEstimate?.outsourcingSqmUnitPrice ?? 0);
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
  standardLaborUnitPrice
) {
  const fromClient = getCostStructureForClient(clients, defaultClient, defaultWorkType);
  const laborState = getInitialOutsourcingState(initialEstimate, standardLaborUnitPrice);

  if (!initialEstimate) {
    return {
      material: fromClient.material,
      pasteLabor: fromClient.pasteLabor,
      substrate: fromClient.substrate,
      auxiliary: fromClient.auxiliary,
      waste: fromClient.waste,
      sellingUnitPrice: 0,
      discount: 0,
      targetProfitRate: DEFAULT_TARGET_PROFIT_RATE,
      ...laborState,
    };
  }

  const material =
    initialEstimate.material ??
    getCostStructureForClient(
      clients,
      initialEstimate.client ?? defaultClient,
      initialEstimate.workType ?? defaultWorkType
    ).material;

  return {
    material,
    pasteLabor: initialEstimate.pasteLabor ?? 0,
    substrate: initialEstimate.substrate ?? 0,
    auxiliary: initialEstimate.auxiliary ?? 0,
    waste: initialEstimate.waste ?? 0,
    sellingUnitPrice: initialEstimate.unitPrice ?? 0,
    discount: initialEstimate.discount ?? 0,
    targetProfitRate: initialEstimate.targetProfitRate ?? DEFAULT_TARGET_PROFIT_RATE,
    ...getInitialOutsourcingState(initialEstimate, standardLaborUnitPrice),
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
  const standardLaborUnitPrice = getStandardLaborUnitPrice(company);

  const initialCost = getInitialCostState(
    clients,
    initialEstimate,
    initialEstimate?.client ?? defaultClient,
    defaultWorkType,
    standardLaborUnitPrice
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
    setMaterial(fromClient.material);
    setPasteLabor(fromClient.pasteLabor);
    setSubstrate(fromClient.substrate);
    setAuxiliary(fromClient.auxiliary);
    setWaste(fromClient.waste);
    if (transportMode === "fixed") {
      setFixedTransport(fromClient.transport);
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
  const judgment = getProfitRateJudgment(totals.rate);
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

      <section style={s.card}>
        <p style={s.cardLabel}>見積利益</p>
        <h2 style={s.cardValue}>{yen(totals.profit)}</h2>
        <p style={s.cardSub}>{formatProfitRateJudgment(totals.rate)}</p>
      </section>

      <div style={s.form}>
        <p style={s.formSection}>現場</p>
        <Input label="現場名" value={siteName} setValue={setSiteName} />
        <Select label="元請" value={client} setValue={setClient} options={clientOptions} />
        <Input label="現場住所" value={siteAddress} setValue={setSiteAddress} />

        <p style={s.formSection}>工事</p>
        <Select label="工事項目" value={workType} setValue={setWorkType} options={WORK_TYPES} />
        <Input label="施工面積 ㎡" value={area} setValue={setArea} type="number" />
        <Input label="値引き 円" value={discount} setValue={setDiscount} type="number" />

        <p style={s.formSection}>原価内訳</p>
        <p style={s.hint}>元請を選ぶと材料費・下地・副資材・廃材・貼り手間が自動入力されます</p>
        <Input label="材料費 円/㎡" value={material} setValue={setMaterial} type="number" />
        <Input label="下地処理費用 円/㎡" value={substrate} setValue={setSubstrate} type="number" />
        <Input label="副資材 円/㎡" value={auxiliary} setValue={setAuxiliary} type="number" />
        <Input label="廃材処分費用 円/㎡" value={waste} setValue={setWaste} type="number" />

        <p style={s.formSection}>貼り手間</p>
        <Input label="貼り手間 円/㎡" value={pasteLabor} setValue={setPasteLabor} type="number" />
        <p style={s.hint}>原価には含めず、販売単価を決める施工手間です</p>

        <p style={s.formSection}>販売単価</p>
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
          style={{ ...s.secondary, width: "100%", marginTop: 8 }}
          onClick={() => setSellingUnitPrice(recommendedSellingUnitPrice)}
        >
          推奨販売単価を販売単価に反映
        </button>

        <p style={s.formSection}>外注費</p>
        <Select
          label="外注費方式"
          value={outsourcingMode}
          setValue={setOutsourcingMode}
          options={OUTSOURCING_MODES}
        />
        {outsourcingMode === "labor" ? (
          <>
            <Input
              label="外注人工"
              value={laborCount}
              setValue={setLaborCount}
              type="number"
            />
            <Input
              label="人工単価 円/人工"
              value={laborUnitPrice}
              setValue={setLaborUnitPrice}
              type="number"
            />
            <p style={s.hint}>外注人工：{Number(laborCount || 0)}人工</p>
            <p style={s.hint}>人工単価：{yen(laborUnitPrice)}/人工</p>
          </>
        ) : (
          <>
            <Input
              label="外注㎡単価 円/㎡"
              value={outsourcingSqmUnitPrice}
              setValue={setOutsourcingSqmUnitPrice}
              type="number"
            />
            <p style={s.hint}>施工面積：{Number(area || 0)}㎡</p>
            <p style={s.hint}>外注㎡単価：{yen(outsourcingSqmUnitPrice)}/㎡</p>
          </>
        )}
        <p style={s.hint}>外注費：{yen(totals.labor)}</p>
        <p style={s.hint}>{outsourcingPreview}</p>
        {showDirectLaborInput && (
          <Input
            label="外注費（直接入力） 円"
            value={directLabor}
            setValue={setDirectLabor}
            type="number"
          />
        )}

        <p style={s.formSection}>交通費・駐車場代</p>
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
        <p style={s.hint}>
          交通費 {yen(totals.transportCost)}（{transportPreviewLabel}）
        </p>
        <Input label="駐車場代 円" value={parkingFee} setValue={setParkingFee} type="number" />

        <Input
          label="目標利益率 %（判定用）"
          value={targetProfitRate}
          setValue={setTargetProfitRate}
          type="number"
        />
      </div>

      <section style={s.result}>
        <p style={s.resultLabel}>原価単価</p>
        <p style={s.resultDetail}>{yen(totals.costUnitPrice)}/㎡</p>

        <p style={s.resultLabel}>貼り手間</p>
        <p style={s.resultDetail}>{yen(totals.pasteLabor)}/㎡</p>

        <p style={s.resultLabel}>推奨販売単価</p>
        <p style={s.resultDetail}>{yen(recommendedSellingUnitPrice)}/㎡</p>

        <p style={s.resultLabel}>販売単価</p>
        <p style={s.resultDetail}>{yen(totals.inputSellingUnitPrice)}/㎡</p>
        {totals.usesRecommendedSellingUnitPrice && (
          <p style={s.hint}>販売単価未入力のため、推奨販売単価を使用中</p>
        )}

        <p style={s.resultLabel}>有効販売単価</p>
        <p style={s.resultDetail}>{yen(totals.effectiveSellingUnitPrice)}/㎡</p>

        <p style={s.resultLabel}>外注費</p>
        <p style={s.resultDetail}>{outsourcingPreview}</p>

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
        <p style={s.resultDetail}>{yen(totals.profit)}</p>

        <p style={s.resultLabel}>利益率</p>
        <p style={s.resultDetail}>
          {totals.sales > 0
            ? formatProfitRateJudgment(totals.rate)
            : "—（売上が0のため計算不可）"}
        </p>

        <p style={s.resultLabel}>判定</p>
        <p style={s.resultDetail}>{judgment.icon} {judgment.label}</p>
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

"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_LABOR_UNIT_PRICE,
  DEFAULT_TARGET_PROFIT_RATE,
  WORK_TYPES,
} from "../lib/constants";
import { getAiProfitDiagnosis, getOrderJudgment } from "../utils/aiProfitDiagnosis";
import {
  calcEstimateTotals,
  calcProfitSimulator,
  getCostStructureForClient,
  normalizeLaborCount,
  yen,
} from "../utils/calcProfit";
import { hasPdfFeatures } from "../lib/plan";
import {
  getDefaultFuelEfficiency,
  getDefaultGasolinePrice,
  getDefaultTripType,
  getInitialTransportState,
  TRANSPORT_MODE_FIXED,
  TRANSPORT_MODE_GPS,
} from "../utils/calcTransport";
import { getEstimateSyncFromSiteMaster } from "../utils/siteMaster";
import { getQuickWorkTypeLabel } from "../utils/quickEstimate";
import SiteTransportSection from "./SiteTransportSection";
import { s } from "../lib/styles";
import { CardButtonGroup, Collapsible, Input, LaborCountStepper, Select } from "./FormFields";

const OUTSOURCING_MODE_OPTIONS = [
  { value: "labor", label: "常用（人工）", icon: "👷" },
  { value: "sqm", label: "請負（㎡）", icon: "📐" },
];

const TRANSPORT_METHOD_OPTIONS = [
  { value: "gps", label: "GPS自動", icon: "🚗" },
  { value: "manual", label: "手入力", icon: "⌨️" },
];

const TRIP_TYPE_OPTIONS = [
  { value: "oneWay", label: "片道" },
  { value: "roundTrip", label: "往復" },
];

function Section({ title, children }) {
  return (
    <section style={s.estimateSection}>
      <h2 style={s.estimateSectionTitle}>{title}</h2>
      <div style={s.estimateSectionBody}>{children}</div>
    </section>
  );
}

function Divider() {
  return <hr style={s.estimateDivider} />;
}

function ResultCard({ sales, cost, profit, rateText, judgmentText, judgmentColor }) {
  return (
    <section style={s.estimateResultCard}>
      <div style={s.estimateHeroDivider} />

      <div style={s.estimateResultRow}>
        <p style={s.estimateResultRowLabel}>売上</p>
        <p style={s.estimateResultRowValue}>{sales}</p>
      </div>

      <div style={s.estimateResultRow}>
        <p style={s.estimateResultRowLabel}>原価</p>
        <p style={s.estimateResultRowValue}>{cost}</p>
      </div>

      <div style={s.estimateResultHero}>
        <p style={s.estimateResultHeroLabel}>利益</p>
        <p style={s.estimateResultHeroValue}>{profit}</p>
      </div>

      <div style={s.estimateResultHero}>
        <p style={s.estimateResultHeroLabel}>利益率</p>
        <p style={{ ...s.estimateResultHeroValue, color: judgmentColor }}>{rateText}</p>
      </div>

      <div style={s.estimateResultJudgment}>
        <p style={{ ...s.estimateResultJudgmentValue, color: judgmentColor }}>
          {judgmentText}
        </p>
      </div>

      <div style={s.estimateHeroDivider} />
    </section>
  );
}

function AiCeoComment({ message }) {
  return (
    <div style={s.estimateAiComment}>
      <p style={s.estimateAiCommentTitle}>🤖 AI社長</p>
      <p style={s.estimateAiCommentText}>{message}</p>
    </div>
  );
}

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
  const laborCount = normalizeLaborCount(initialEstimate?.laborCount ?? 0);
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
  siteMasters,
  initialEstimate,
  defaultClient,
  defaultWorkType,
  company
) {
  const synced = getEstimateSyncFromSiteMaster(clients, siteMasters, defaultClient, defaultWorkType);
  const fromClient = getCostStructureForClient(clients, defaultClient, defaultWorkType);

  if (!initialEstimate) {
    return {
      material: synced.material,
      pasteLabor: synced.pasteLabor,
      substrate: synced.substrate,
      auxiliary: synced.auxiliary,
      waste: synced.waste,
      sellingUnitPrice: 0,
      discount: 0,
      targetProfitRate: synced.targetProfitRate,
      desiredProfitAmount: 0,
      outsourcingMode: synced.outsourcingMode,
      laborCount: 0,
      laborUnitPrice: synced.laborUnitPrice,
      outsourcingSqmUnitPrice: synced.outsourcingSqmUnitPrice,
      directLabor: 0,
    };
  }

  const material =
    initialEstimate.material ??
    getEstimateSyncFromSiteMaster(
      clients,
      siteMasters,
      initialEstimate.client ?? defaultClient,
      initialEstimate.workType ?? defaultWorkType
    ).material;

  const editSynced = getEstimateSyncFromSiteMaster(
    clients,
    siteMasters,
    initialEstimate.client ?? defaultClient,
    initialEstimate.workType ?? defaultWorkType
  );

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
    targetProfitRate: initialEstimate.targetProfitRate ?? editSynced.targetProfitRate,
    desiredProfitAmount: initialEstimate.desiredProfitAmount ?? 0,
    ...getInitialOutsourcingState(initialEstimate, editClient, company),
  };
}

export default function EstimateForm({
  clients,
  siteMasters = [],
  company,
  plan,
  onBack,
  onSave,
  onPdf,
  onInvoicePdf,
  onPdfBlocked,
  initialEstimate,
  isCopy = false,
  isQuickEstimate = false,
}) {
  const editing = !!initialEstimate && !isCopy && !isQuickEstimate;
  const defaultClient = clients[0]?.name || "";
  const defaultWorkType = initialEstimate?.workType ?? "クロス SP";
  const skipClientSync = useRef(editing || isCopy || isQuickEstimate);

  const initialCost = getInitialCostState(
    clients,
    siteMasters,
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
    ).transport,
    company
  );

  const [siteName, setSiteName] = useState(initialEstimate?.siteName ?? "");
  const [siteAddress, setSiteAddress] = useState(initialEstimate?.siteAddress ?? "");
  const [client, setClient] = useState(initialEstimate?.client ?? defaultClient);
  const [workType, setWorkType] = useState(defaultWorkType);
  const [area, setArea] = useState(
    isQuickEstimate ? (initialEstimate?.area ?? 0) : (initialEstimate?.area ?? 100)
  );
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
  const [desiredProfitAmount] = useState(initialCost.desiredProfitAmount);
  const [transportFeeMethod, setTransportFeeMethod] = useState(
    initialTransport.transportFeeMethod
  );
  const [transportMode, setTransportMode] = useState(initialTransport.transportMode);
  const [distanceKm, setDistanceKm] = useState(initialTransport.distanceKm);
  const [tripType, setTripType] = useState(initialTransport.tripType);
  const [kmRate, setKmRate] = useState(initialTransport.kmRate);
  const [fuelEfficiencyKmPerL, setFuelEfficiencyKmPerL] = useState(
    initialTransport.fuelEfficiencyKmPerL
  );
  const [gasolinePricePerL, setGasolinePricePerL] = useState(initialTransport.gasolinePricePerL);
  const [fixedTransport, setFixedTransport] = useState(initialTransport.fixedTransport);
  const [highwayToll, setHighwayToll] = useState(initialTransport.highwayToll ?? 0);
  const [parkingFee, setParkingFee] = useState(initialTransport.parkingFee);
  const [currentLat, setCurrentLat] = useState(initialTransport.currentLat);
  const [currentLng, setCurrentLng] = useState(initialTransport.currentLng);
  const [currentLocationLabel, setCurrentLocationLabel] = useState(
    initialTransport.currentLocationLabel
  );
  const [showTransportDetails, setShowTransportDetails] = useState(false);

  const handleTransportFeeMethodChange = (method) => {
    setTransportFeeMethod(method);
    if (method === "gps") {
      setTransportMode(TRANSPORT_MODE_GPS);
      setTripType(getDefaultTripType(company));
      setFuelEfficiencyKmPerL(getDefaultFuelEfficiency(company));
      setGasolinePricePerL(getDefaultGasolinePrice(company));
      return;
    }
    setTransportMode(TRANSPORT_MODE_FIXED);
  };

  const activeTransportMode =
    transportFeeMethod === "gps" ? TRANSPORT_MODE_GPS : TRANSPORT_MODE_FIXED;

  useEffect(() => {
    if (!clients.some((c) => c.name === client) && clients[0]) {
      setClient(clients[0].name);
      return;
    }
    if (skipClientSync.current) {
      skipClientSync.current = false;
      return;
    }

    const synced = getEstimateSyncFromSiteMaster(clients, siteMasters, client, workType);
    setMaterial(synced.material);
    setPasteLabor(synced.pasteLabor);
    setSubstrate(synced.substrate);
    setAuxiliary(synced.auxiliary);
    setWaste(synced.waste);
    setOutsourcingMode(synced.outsourcingMode);
    setLaborUnitPrice(synced.laborUnitPrice);
    setOutsourcingSqmUnitPrice(synced.outsourcingSqmUnitPrice);
    setTargetProfitRate(synced.targetProfitRate);
    if (transportFeeMethod === "manual") {
      setFixedTransport(synced.fixedTransport);
    }
  }, [clients, siteMasters, client, workType, transportFeeMethod]);

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
    transportMode: activeTransportMode,
    transportFeeMethod,
    distanceKm,
    kmRate,
    tripType,
    fixedTransport,
    fuelEfficiencyKmPerL,
    gasolinePricePerL,
    highwayToll,
    parkingFee,
  });
  const profitSimulator = calcProfitSimulator({
    totalCost: totals.cost,
    area,
    desiredProfitRate: targetProfitRate,
    desiredProfitAmount,
  });

  useEffect(() => {
    if (!isQuickEstimate) return;
    if (!profitSimulator.canCalculate) return;
    setSellingUnitPrice(profitSimulator.recommendedUnitPrice);
  }, [
    isQuickEstimate,
    profitSimulator.canCalculate,
    profitSimulator.recommendedUnitPrice,
  ]);

  const orderJudgment = getOrderJudgment(totals.rate);
  const aiDiagnosis = getAiProfitDiagnosis({
    rate: totals.rate,
    totalCost: totals.cost,
    area,
    effectiveSellingUnitPrice: totals.effectiveSellingUnitPrice,
    discount: totals.discount,
    profit: totals.profit,
    targetProfitRate,
  });
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
    transportFeeMethod,
    transportMode: activeTransportMode,
    distanceKm,
    tripType,
    kmRate,
    fuelEfficiencyKmPerL,
    gasolinePricePerL,
    fixedTransport,
    highwayToll,
    parkingFee,
    currentLat,
    currentLng,
    currentLocationLabel,
    transport: totals.transportCost,
    transportCost: totals.transportCost,
    travelCostTotal: totals.travelCostTotal,
    unitPrice: sellingUnitPrice,
    sales: totals.sales,
    cost: totals.cost,
    profit: totals.profit,
    rate: totals.rate,
    paymentStatus: initialEstimate?.paymentStatus,
    createdAt: initialEstimate?.createdAt ?? new Date().toLocaleString("ja-JP"),
  });

  const handlePdf = (type) => {
    if (!pdfEnabled) {
      onPdfBlocked?.();
      return;
    }
    const estimate = buildEstimate();
    if (type === "invoice") {
      onInvoicePdf?.(estimate);
    } else {
      onPdf?.(estimate);
    }
  };

  if (clientOptions.length === 0) {
    return (
      <main style={s.estimatePage}>
        <button style={s.back} onClick={onBack}>← 戻る</button>
        <h1 style={s.estimatePageTitle}>見積作成</h1>
        <p style={s.muted}>元請が未登録です。</p>
      </main>
    );
  }

  const rateText =
    totals.sales > 0 ? `${Number(totals.rate || 0).toFixed(1)}%` : "—";
  const judgmentText = `${orderJudgment.icon}${orderJudgment.label}`;
  const aiMessage =
    aiDiagnosis.canDiagnose && totals.sales > 0
      ? aiDiagnosis.status.message || "—"
      : "売上を入力するとAI社長がアドバイスします。";

  return (
    <main style={s.estimatePage}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.estimatePageTitle}>
        {isQuickEstimate
          ? "ワンタップ見積"
          : isCopy
            ? "見積コピー"
            : editing
              ? "見積編集"
              : "見積作成"}
      </h1>

      {isQuickEstimate && (
        <div style={s.quickEstimateFormHeader}>
          <p style={s.quickEstimateFormMeta}>
            {client} · {getQuickWorkTypeLabel(workType)}
          </p>
          <p style={s.quickEstimateFormHint}>
            元請・原価・外注方式・目標利益率は現場マスターから自動入力済みです。
          </p>
          <div style={s.estimateCostHero}>
            <div style={s.estimateHeroDivider} />
            <p style={s.estimateCostHeroLabel}>原価単価</p>
            <p style={s.estimateCostHeroValue}>{yen(totals.costUnitPrice)}/㎡</p>
            <div style={s.estimateHeroDivider} />
          </div>
        </div>
      )}

      <Section title={isQuickEstimate ? "① 現場・面積" : "① 現場情報"}>
        <Input large label="現場名" value={siteName} setValue={setSiteName} />
        {!isQuickEstimate && (
          <>
            <Select large label="元請" value={client} setValue={setClient} options={clientOptions} />
            <Input large label="現場住所" value={siteAddress} setValue={setSiteAddress} />
            <Select
              large
              label="工事項目"
              value={workType}
              setValue={setWorkType}
              options={WORK_TYPES}
            />
          </>
        )}
        <Input large label="施工面積 ㎡" value={area} setValue={setArea} type="number" />
      </Section>

      {!isQuickEstimate && (
        <>
          <Divider />

          <Section title="② 原価">
            <div style={s.estimateCostHero}>
              <div style={s.estimateHeroDivider} />
              <p style={s.estimateCostHeroLabel}>原価単価</p>
              <p style={s.estimateCostHeroValue}>{yen(totals.costUnitPrice)}/㎡</p>
              <div style={s.estimateHeroDivider} />
            </div>
            <Input large label="材料費" value={material} setValue={setMaterial} type="number" />
            <Input large label="貼り手間" value={pasteLabor} setValue={setPasteLabor} type="number" />
            <Input large label="下地処理" value={substrate} setValue={setSubstrate} type="number" />
            <Input large label="副資材" value={auxiliary} setValue={setAuxiliary} type="number" />
            <Input large label="廃材処分" value={waste} setValue={setWaste} type="number" />
          </Section>
        </>
      )}

      {(isQuickEstimate ? outsourcingMode === "labor" : true) && (
        <>
          <Divider />

          <Section title={isQuickEstimate ? "② 外注数量" : "③ 外注"}>
            {!isQuickEstimate && (
              <CardButtonGroup
                value={outsourcingMode}
                setValue={setOutsourcingMode}
                options={OUTSOURCING_MODE_OPTIONS}
              />
            )}
            {outsourcingMode === "labor" && (
              <>
                <LaborCountStepper value={laborCount} setValue={setLaborCount} large />
                {!isQuickEstimate && (
                  <Input
                    large
                    label="常用単価 円/人工"
                    value={laborUnitPrice}
                    setValue={setLaborUnitPrice}
                    type="number"
                  />
                )}
              </>
            )}
            {!isQuickEstimate && outsourcingMode === "sqm" && (
              <Input
                large
                label="請負単価 円/㎡"
                value={outsourcingSqmUnitPrice}
                setValue={setOutsourcingSqmUnitPrice}
                type="number"
              />
            )}
            {!isQuickEstimate && showDirectLaborInput && (
              <Input
                large
                label="外注費 円"
                value={directLabor}
                setValue={setDirectLabor}
                type="number"
              />
            )}
          </Section>
        </>
      )}

      <Divider />

      <Section title={isQuickEstimate ? (outsourcingMode === "labor" ? "③ 交通費" : "② 交通費") : "④ 経費"}>
        {isQuickEstimate ? (
          <Input
            large
            label="交通費 円"
            value={fixedTransport}
            setValue={setFixedTransport}
            type="number"
          />
        ) : (
          <>
        <CardButtonGroup
          value={transportFeeMethod}
          setValue={handleTransportFeeMethodChange}
          options={TRANSPORT_METHOD_OPTIONS}
        />
        {transportFeeMethod === "gps" && (
          <>
            <SiteTransportSection
              company={company}
              siteAddress={siteAddress}
              distanceKm={distanceKm}
              currentLat={currentLat}
              currentLng={currentLng}
              currentLocationLabel={currentLocationLabel}
              onLocationChange={({ lat, lng, label }) => {
                setCurrentLat(lat);
                setCurrentLng(lng);
                setCurrentLocationLabel(label);
              }}
              onDistanceChange={setDistanceKm}
            />
            <Input
              large
              label="距離 km"
              value={distanceKm}
              setValue={setDistanceKm}
              type="number"
            />
            <div style={s.estimateReadonlyLarge}>
              <p style={s.estimateReadonlyLabel}>交通費 円</p>
              <p style={s.estimateReadonlyValueLarge}>{yen(totals.transportCost)}</p>
            </div>
            <Input large label="高速代 円" value={highwayToll} setValue={setHighwayToll} type="number" />
            <Input large label="駐車場代 円" value={parkingFee} setValue={setParkingFee} type="number" />
            <button
              type="button"
              style={s.estimateDetailToggleBtn}
              onClick={() => setShowTransportDetails((open) => !open)}
            >
              {showTransportDetails ? "詳細設定を閉じる" : "詳細設定"}
            </button>
            {showTransportDetails && (
              <>
                <Input
                  large
                  label="燃費 km/L"
                  value={fuelEfficiencyKmPerL}
                  setValue={setFuelEfficiencyKmPerL}
                  type="number"
                />
                <Input
                  large
                  label="ガソリン単価 円/L"
                  value={gasolinePricePerL}
                  setValue={setGasolinePricePerL}
                  type="number"
                />
                <CardButtonGroup
                  label="片道 / 往復"
                  value={tripType}
                  setValue={setTripType}
                  options={TRIP_TYPE_OPTIONS}
                />
              </>
            )}
          </>
        )}
        {transportFeeMethod === "manual" && (
          <>
            <Input large label="交通費 円" value={fixedTransport} setValue={setFixedTransport} type="number" />
            <Input large label="高速代 円" value={highwayToll} setValue={setHighwayToll} type="number" />
            <Input large label="駐車場代 円" value={parkingFee} setValue={setParkingFee} type="number" />
          </>
        )}
          </>
        )}
      </Section>

      {!isQuickEstimate && (
        <>
          <Divider />

          <Section title="⑤ 売価">
            <Input
              large
              label="販売単価 円/㎡"
              value={sellingUnitPrice}
              setValue={setSellingUnitPrice}
              type="number"
            />
            <div style={s.estimateReadonlyLarge}>
              <p style={s.estimateReadonlyLabel}>推奨販売単価</p>
              <p style={s.estimateReadonlyValueLarge}>
                {profitSimulator.canCalculate
                  ? `${yen(profitSimulator.recommendedUnitPrice)}/㎡`
                  : "—"}
              </p>
            </div>
            <button
              type="button"
              style={s.estimateApplyBtn}
              disabled={!profitSimulator.canCalculate}
              onClick={() => setSellingUnitPrice(profitSimulator.recommendedUnitPrice)}
            >
              販売単価へ反映
            </button>
            <Collapsible label="詳細（値引き・目標利益率）">
              <Input large label="値引き 円" value={discount} setValue={setDiscount} type="number" />
              <Input
                large
                label="目標利益率 %"
                value={targetProfitRate}
                setValue={setTargetProfitRate}
                type="number"
              />
            </Collapsible>
          </Section>
        </>
      )}

      <ResultCard
        sales={yen(totals.sales)}
        cost={yen(totals.cost)}
        profit={yen(totals.profit)}
        rateText={rateText}
        judgmentText={judgmentText}
        judgmentColor={orderJudgment.color}
      />

      <AiCeoComment message={aiMessage} />

      <div style={s.estimateActions}>
        <button style={s.save} type="button" onClick={() => onSave(buildEstimate())}>
          見積を保存
        </button>
        <button
          style={{ ...s.pdf, opacity: pdfEnabled ? 1 : 0.5 }}
          type="button"
          onClick={() => handlePdf("estimate")}
        >
          見積書印刷
        </button>
        <button
          style={{ ...s.estimateInvoiceBtn, opacity: pdfEnabled ? 1 : 0.5 }}
          type="button"
          onClick={() => handlePdf("invoice")}
        >
          請求書印刷
        </button>
      </div>
    </main>
  );
}

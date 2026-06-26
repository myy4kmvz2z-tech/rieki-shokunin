"use client";

import { useEffect, useMemo, useState } from "react";
import "./globals.css";

const yen = (n) => `${Math.round(Number(n) || 0).toLocaleString("ja-JP")}円`;
const pct = (n) => `${((Number(n) || 0) * 100).toFixed(1)}%`;

const defaultClients = [
  { id: "branchone", name: "BRANCHONE", sp: 230, aa: 415, cf: 1530, floor: 1200, sheet: 1800, fixed: true },
  { id: "bluerino", name: "ブルリノベ", sp: 235, aa: 425, cf: 1600, floor: 1250, sheet: 1850, fixed: true },
  { id: "house", name: "ハウスメンテナンス", sp: 240, aa: 430, cf: 1580, floor: 1280, sheet: 1850, fixed: true },
  { id: "other", name: "その他", sp: 230, aa: 415, cf: 1530, floor: 1200, sheet: 1800, fixed: true },
];

const workLabels = {
  sp: "クロス SP",
  aa: "クロス AA",
  cf: "CF",
  floor: "フロアタイル",
  sheet: "シート",
};

function safeNumber(v) {
  return Number(v) || 0;
}

export default function Page() {
  const [clients, setClients] = useState(defaultClients);
  const [clientId, setClientId] = useState("branchone");
  const [workType, setWorkType] = useState("sp");

  const [siteName, setSiteName] = useState("");
  const [siteMemo, setSiteMemo] = useState("");
  const [area, setArea] = useState(100);
  const [distance, setDistance] = useState(60);
  const [trips, setTrips] = useState(1);
  const [discount, setDiscount] = useState(0);

  const [originAddress, setOriginAddress] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [manualDistance, setManualDistance] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");

  const [labor, setLabor] = useState(1000);
  const [supplies, setSupplies] = useState(80);
  const [shitaji, setShitaji] = useState(33.3333);
  const [disposal, setDisposal] = useState(30);
  const [fuelKm, setFuelKm] = useState(9);
  const [fuelPrice, setFuelPrice] = useState(200);
  const [targetRate, setTargetRate] = useState(25);

  const [crossUnit, setCrossUnit] = useState(23000);
  const [crossNinkou, setCrossNinkou] = useState(1);
  const [cfUnit, setCfUnit] = useState(23000);
  const [cfNinkou, setCfNinkou] = useState(0);
  const [floorUnit, setFloorUnit] = useState(23000);
  const [floorNinkou, setFloorNinkou] = useState(0);
  const [sheetUnit, setSheetUnit] = useState(23000);
  const [sheetNinkou, setSheetNinkou] = useState(0);

  const [customerName, setCustomerName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [estimateDocNo, setEstimateDocNo] = useState("");
  const [invoiceDocNo, setInvoiceDocNo] = useState("");
  const [paymentDue, setPaymentDue] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [stampImage, setStampImage] = useState("");

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [paper, setPaper] = useState(null);

  const [newClientName, setNewClientName] = useState("");
  const [newSp, setNewSp] = useState(230);
  const [newAa, setNewAa] = useState(415);
  const [newCf, setNewCf] = useState(1530);
  const [newFloor, setNewFloor] = useState(1200);
  const [newSheet, setNewSheet] = useState(1800);

  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem("rieki_clients_next_v1") || "[]");
    setClients([...defaultClients, ...savedClients]);
    setHistory(JSON.parse(localStorage.getItem("rieki_history_next_v1") || "[]"));
    setGoogleApiKey(localStorage.getItem("rieki_google_maps_api_key") || "");
    setStampImage(localStorage.getItem("rieki_stamp_image_next_v1") || "");
  }, []);

  const currentClient = useMemo(() => {
    return clients.find((c) => c.id === clientId) || clients[0] || defaultClients[0];
  }, [clients, clientId]);

  const materialUnit = useMemo(() => {
    return safeNumber(currentClient?.[workType]);
  }, [currentClient, workType]);

  const calc = useMemo(() => {
    const unitPrice = materialUnit + safeNumber(labor);
    const salesBeforeDiscount = unitPrice * safeNumber(area);
    const discountAmount = safeNumber(discount);
    const sales = Math.max(0, salesBeforeDiscount - discountAmount);

    const materialCost = materialUnit * safeNumber(area);
    const suppliesCost = safeNumber(supplies) * safeNumber(area);
    const shitajiCost = workType === "sp" || workType === "aa" ? safeNumber(shitaji) * safeNumber(area) : 0;
    const disposalCost = safeNumber(disposal) * safeNumber(area);
    const travelCost = safeNumber(fuelKm) ? safeNumber(distance) / safeNumber(fuelKm) * safeNumber(fuelPrice) * safeNumber(trips) : 0;

    const crossOutCost = safeNumber(crossUnit) * safeNumber(crossNinkou);
    const cfOutCost = safeNumber(cfUnit) * safeNumber(cfNinkou);
    const floorOutCost = safeNumber(floorUnit) * safeNumber(floorNinkou);
    const sheetOutCost = safeNumber(sheetUnit) * safeNumber(sheetNinkou);
    const outsourcing = crossOutCost + cfOutCost + floorOutCost + sheetOutCost;

    const cost = materialCost + suppliesCost + shitajiCost + disposalCost + travelCost + outsourcing;
    const profit = sales - cost;
    const profitRate = sales ? profit / sales : 0;
    const taxSales = sales * 1.1;
    const judge = profitRate >= safeNumber(targetRate) / 100 ? "OK" : "要調整";

    return {
      unitPrice, salesBeforeDiscount, discountAmount, sales, materialCost, suppliesCost,
      shitajiCost, disposalCost, travelCost, crossOutCost, cfOutCost, floorOutCost,
      sheetOutCost, outsourcing, cost, profit, profitRate, taxSales, judge
    };
  }, [materialUnit, labor, area, discount, supplies, shitaji, workType, disposal, fuelKm, distance, fuelPrice, trips, crossUnit, crossNinkou, cfUnit, cfNinkou, floorUnit, floorNinkou, sheetUnit, sheetNinkou, targetRate]);

  function showToast(title, sub = "") {
    setToast({ title, sub });
    if (navigator.vibrate) navigator.vibrate(80);
    setTimeout(() => setToast(null), 2300);
  }

  function saveClients(nextClients) {
    const custom = nextClients.filter((c) => !c.fixed);
    localStorage.setItem("rieki_clients_next_v1", JSON.stringify(custom));
    setClients(nextClients);
  }

  function addClient() {
    const name = newClientName.trim();
    if (!name) return alert("元請名を入力してください");
    const c = {
      id: `client_${Date.now()}`,
      name,
      sp: safeNumber(newSp),
      aa: safeNumber(newAa),
      cf: safeNumber(newCf),
      floor: safeNumber(newFloor),
      sheet: safeNumber(newSheet),
      fixed: false,
    };
    const next = [...clients, c];
    saveClients(next);
    setClientId(c.id);
    setNewClientName("");
    showToast("元請を追加しました", name);
  }

  function deleteClient() {
    const c = currentClient;
    if (c.fixed) return alert("初期登録の元請は削除できません");
    if (!confirm(`${c.name} を削除しますか？`)) return;
    const next = clients.filter((x) => x.id !== c.id);
    saveClients(next);
    setClientId("branchone");
    showToast("元請を削除しました", c.name);
  }

  function nextNo() {
    const current = safeNumber(localStorage.getItem("rieki_estimate_no_next_v1")) + 1;
    localStorage.setItem("rieki_estimate_no_next_v1", String(current));
    return String(current).padStart(5, "0");
  }

  function saveEstimate() {
    if (!siteName.trim()) {
      alert("現場名を入力してください");
      return;
    }
    const no = nextNo();
    const item = {
      id: `estimate_${Date.now()}`,
      no,
      date: new Date().toLocaleString("ja-JP"),
      siteName,
      siteMemo,
      clientId,
      client: currentClient.name,
      workType,
      workName: workLabels[workType],
      area: safeNumber(area),
      distance: safeNumber(distance),
      trips: safeNumber(trips),
      sales: calc.sales,
      profit: calc.profit,
      profitRate: calc.profitRate,
      values: { area, distance, trips, discount, crossUnit, crossNinkou, cfUnit, cfNinkou, floorUnit, floorNinkou, sheetUnit, sheetNinkou }
    };
    const next = [...history, item].slice(-100);
    localStorage.setItem("rieki_history_next_v1", JSON.stringify(next));
    setHistory(next);
    showToast("見積を登録しました", `No.${no} / ${siteName}`);
  }

  function restoreEstimate(item) {
    setSiteName(item.siteName || "");
    setSiteMemo(item.siteMemo || "");
    setClientId(item.clientId || "branchone");
    setWorkType(item.workType || "sp");
    setArea(item.values?.area ?? item.area ?? 100);
    setDistance(item.values?.distance ?? item.distance ?? 0);
    setTrips(item.values?.trips ?? item.trips ?? 1);
    setDiscount(item.values?.discount ?? 0);
    setCrossUnit(item.values?.crossUnit ?? 23000);
    setCrossNinkou(item.values?.crossNinkou ?? 1);
    setCfUnit(item.values?.cfUnit ?? 23000);
    setCfNinkou(item.values?.cfNinkou ?? 0);
    setFloorUnit(item.values?.floorUnit ?? 23000);
    setFloorNinkou(item.values?.floorNinkou ?? 0);
    setSheetUnit(item.values?.sheetUnit ?? 23000);
    setSheetNinkou(item.values?.sheetNinkou ?? 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("見積を開きました", `No.${item.no}`);
  }

  function deleteEstimate(id) {
    const item = history.find((h) => h.id === id);
    if (!item) return;
    if (!confirm(`No.${item.no} ${item.siteName} を削除しますか？`)) return;
    const next = history.filter((h) => h.id !== id);
    localStorage.setItem("rieki_history_next_v1", JSON.stringify(next));
    setHistory(next);
    showToast("削除しました", `No.${item.no}`);
  }

  function clearHistory() {
    if (!confirm("見積履歴をすべて削除しますか？")) return;
    localStorage.removeItem("rieki_history_next_v1");
    setHistory([]);
    showToast("履歴を削除しました");
  }

  function reflectDistance() {
    const km = safeNumber(manualDistance);
    if (!km) return alert("MAPで見た距離を入力してください");
    setDistance(km);
    showToast("走行距離に反映しました", `${km}km`);
  }

  function openGoogleMap() {
    if (!siteAddress.trim()) return alert("現場住所を入力してください");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originAddress)}&destination=${encodeURIComponent(siteAddress)}&travelmode=driving`;
    window.open(url, "_blank");
  }

  async function handleStamp(file) {
    if (!file) return;
    const img = await fileToDataUrl(file);
    localStorage.setItem("rieki_stamp_image_next_v1", img);
    setStampImage(img);
    showToast("印影を登録しました", "書類に反映されます");
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const max = 700;
          let { width, height } = image;
          if (width > height && width > max) {
            height = Math.round(height * max / width);
            width = max;
          } else if (height >= width && height > max) {
            width = Math.round(width * max / height);
            height = max;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function clearStamp() {
    localStorage.removeItem("rieki_stamp_image_next_v1");
    setStampImage("");
    showToast("印影を削除しました");
  }

  function docNo(prefix, entered) {
    if (entered?.trim()) return entered.trim();
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
    return `${prefix}-${ymd}`;
  }

  function issueDocument(kind) {
    const isInvoice = kind === "invoice";
    setPaper({
      kind,
      title: isInvoice ? "御請求書" : "御見積書",
      no: isInvoice ? docNo("INV", invoiceDocNo) : docNo("EST", estimateDocNo),
      date: new Date().toLocaleDateString("ja-JP"),
      customer: customerName.trim() || `${currentClient.name} 御中`,
      issuer: issuerName.trim() || "発行者未入力",
      siteName: siteName.trim() || "未入力",
      client: currentClient.name,
      workName: workLabels[workType],
      area: safeNumber(area),
      unitPrice: calc.unitPrice,
      salesBeforeDiscount: calc.salesBeforeDiscount,
      discountAmount: calc.discountAmount,
      sales: calc.sales,
      tax: calc.sales * 0.1,
      total: calc.taxSales,
      paymentDue,
      bankInfo,
      stampImage,
      note: isInvoice ? "上記の通り御請求申し上げます。" : "上記の通り御見積申し上げます。",
      totalLabel: isInvoice ? "御請求金額" : "御見積金額",
    });
    setTimeout(() => window.print(), 150);
  }

  const filteredHistory = history.filter((h) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${h.siteName} ${h.client} ${h.workName}`.toLowerCase().includes(q);
  });

  return (
    <>
      <main className="phone">
        <header className="top">
          <div>
            <p className="brand-kana">職人のための見積・利益管理</p>
            <h1>利益職人</h1>
            <p className="version">本番 Ver.1.0</p>
          </div>
          <div className="badge">Web版</div>
        </header>

        <section className="hero">
          <p>見積3分。利益は一瞬。</p>
          <strong>{yen(calc.profit)}</strong>
          <span>利益率 {pct(calc.profitRate)}</span>
        </section>

        <section className="card">
          <div className="card-title">入力</div>
          <Input label="現場名" value={siteName} onChange={setSiteName} placeholder="例：○○様邸 / △△マンション" />
          <Input label="担当者・メモ" value={siteMemo} onChange={setSiteMemo} placeholder="例：山田様 / 2階クロス" />
          <Label title="元請">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Label>
          <Label title="工事項目">
            <select value={workType} onChange={(e) => setWorkType(e.target.value)}>
              {Object.entries(workLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Label>
          <NumberInput label="施工面積" unit="㎡" value={area} onChange={setArea} />
          <NumberInput label="走行距離" unit="km" value={distance} onChange={setDistance} />
          <NumberInput label="現場回数" unit="回" value={trips} onChange={setTrips} />
          <NumberInput label="値引き" unit="円" value={discount} onChange={setDiscount} />
        </section>

        <section className="card">
          <div className="card-title">MAPで距離計算</div>
          <Input label="出発地" value={originAddress} onChange={setOriginAddress} placeholder="例：会社住所 / 自宅住所" />
          <Input label="現場住所" value={siteAddress} onChange={setSiteAddress} placeholder="例：名古屋市西区○○" />
          <div className="actions">
            <button className="green" onClick={openGoogleMap}>Googleマップで距離を見る</button>
            <button className="blue" onClick={() => localStorage.setItem("rieki_google_maps_api_key", googleApiKey)}>APIキー保存</button>
          </div>
          <NumberInput label="MAPで見た距離" unit="km" value={manualDistance} onChange={setManualDistance} />
          <button className="wide orange" onClick={reflectDistance}>走行距離に反映</button>
          <Input label="Google Maps APIキー" value={googleApiKey} onChange={setGoogleApiKey} placeholder="AIza..." type="password" />
          <p className="hint">販売版ではAPIキーはアプリ内に置かず、サーバー側で管理するのが安全です。</p>
        </section>

        <section className="card">
          <div className="card-title">工種別 外注費</div>
          <Outsource label="クロス外注" unit={crossUnit} setUnit={setCrossUnit} ninkou={crossNinkou} setNinkou={setCrossNinkou} />
          <Outsource label="CF外注" unit={cfUnit} setUnit={setCfUnit} ninkou={cfNinkou} setNinkou={setCfNinkou} />
          <Outsource label="フロアタイル外注" unit={floorUnit} setUnit={setFloorUnit} ninkou={floorNinkou} setNinkou={setFloorNinkou} />
          <Outsource label="シート外注" unit={sheetUnit} setUnit={setSheetUnit} ninkou={sheetNinkou} setNinkou={setSheetNinkou} />
        </section>

        <section className="cards2">
          <Mini title="売上" value={yen(calc.sales)} />
          <Mini title="原価" value={yen(calc.cost)} />
        </section>

        <section className="card result-list">
          <div className="card-title">内訳</div>
          <Row label="見積単価" value={`${yen(calc.unitPrice)}/㎡`} />
          <Row label="税抜売上" value={yen(calc.sales)} />
          <Row label="値引き" value={`-${yen(calc.discountAmount)}`} />
          <Row label="材料費" value={yen(calc.materialCost)} />
          <Row label="副資材" value={yen(calc.suppliesCost)} />
          <Row label="下地調整" value={yen(calc.shitajiCost)} />
          <Row label="処分費" value={yen(calc.disposalCost)} />
          <Row label="交通費" value={yen(calc.travelCost)} />
          <Row label="外注費合計" value={yen(calc.outsourcing)} />
          <Row label="税込売上" value={yen(calc.taxSales)} />
          <div className="judge-row"><span>判定</span><strong className={calc.judge === "OK" ? "ok" : "ng"}>{calc.judge}</strong></div>
        </section>

        <section className="actions docs-actions">
          <button className="orange" onClick={saveEstimate}>見積を登録</button>
          <button className="blue" onClick={() => issueDocument("estimate")}>見積書を発行</button>
          <button className="purple" onClick={() => issueDocument("invoice")}>請求書を発行</button>
        </section>

        <section className="card">
          <div className="card-title">書類設定</div>
          <Input label="宛名" value={customerName} onChange={setCustomerName} placeholder="例：BRANCHONE様 / ○○様" />
          <Input label="発行者" value={issuerName} onChange={setIssuerName} placeholder="例：株式会社○○ / 安部" />
          <div className="settings-grid">
            <Input label="見積番号" value={estimateDocNo} onChange={setEstimateDocNo} placeholder="自動" />
            <Input label="請求番号" value={invoiceDocNo} onChange={setInvoiceDocNo} placeholder="自動" />
            <Input label="支払期限" value={paymentDue} onChange={setPaymentDue} type="date" />
            <Input label="振込先" value={bankInfo} onChange={setBankInfo} placeholder="○○銀行 ○○支店 普通 1234567" />
          </div>
          <div className="stamp-setting">
            <div className="card-subtitle">印影設定</div>
            <Label title="写真から印影を選ぶ">
              <input type="file" accept="image/*" onChange={(e) => handleStamp(e.target.files?.[0])} />
            </Label>
            <Label title="カメラで印影を撮る">
              <input type="file" accept="image/*" capture="environment" onChange={(e) => handleStamp(e.target.files?.[0])} />
            </Label>
            {stampImage ? <img className="stamp-preview" src={stampImage} alt="印影プレビュー" /> : <p className="hint">印影はまだ登録されていません。</p>}
            <button className="danger small" onClick={clearStamp}>印影を削除</button>
          </div>
        </section>

        <section className="card">
          <div className="card-title">元請を追加・編集</div>
          <Input label="元請名" value={newClientName} onChange={setNewClientName} placeholder="例：○○工務店" />
          <div className="settings-grid">
            <NumberBasic label="SP単価" value={newSp} onChange={setNewSp} />
            <NumberBasic label="AA単価" value={newAa} onChange={setNewAa} />
            <NumberBasic label="CF単価" value={newCf} onChange={setNewCf} />
            <NumberBasic label="床単価" value={newFloor} onChange={setNewFloor} />
            <NumberBasic label="シート単価" value={newSheet} onChange={setNewSheet} />
          </div>
          <div className="actions">
            <button className="orange" onClick={addClient}>元請を追加</button>
            <button className="danger" onClick={deleteClient}>選択中を削除</button>
          </div>
        </section>

        <section className="card">
          <div className="card-title">共通設定</div>
          <div className="settings-grid">
            <NumberBasic label="貼り手間" value={labor} onChange={setLabor} />
            <NumberBasic label="副資材" value={supplies} onChange={setSupplies} />
            <NumberBasic label="下地調整" value={shitaji} onChange={setShitaji} />
            <NumberBasic label="処分費" value={disposal} onChange={setDisposal} />
            <NumberBasic label="燃費 km/L" value={fuelKm} onChange={setFuelKm} />
            <NumberBasic label="ガソリン 円/L" value={fuelPrice} onChange={setFuelPrice} />
            <NumberBasic label="目標利益率 %" value={targetRate} onChange={setTargetRate} />
          </div>
        </section>

        <section className="card history">
          <div className="card-title">見積一覧</div>
          <div className="search-row">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="現場名・元請で検索" />
            <button className="danger small" onClick={clearHistory}>履歴削除</button>
          </div>
          {!filteredHistory.length ? <p className="hint">まだ登録はありません</p> : filteredHistory.slice().reverse().map((item) => (
            <div className="history-item" key={item.id}>
              <div className="history-top">
                <div>
                  <div className="history-title">{item.siteName}</div>
                  <div className="history-meta">{item.client} / {item.workName} / {item.area}㎡<br />{item.date}</div>
                </div>
                <div className="history-no">No.{item.no}</div>
              </div>
              <div className="history-money">
                <div><span>売上</span><strong>{yen(item.sales)}</strong></div>
                <div><span>利益</span><strong>{yen(item.profit)}</strong></div>
                <div><span>利益率</span><strong>{pct(item.profitRate)}</strong></div>
                <div><span>税込</span><strong>{yen(item.sales * 1.1)}</strong></div>
              </div>
              <div className="history-actions four">
                <button className="blue" onClick={() => restoreEstimate(item)}>開く</button>
                <button className="orange" onClick={() => { restoreEstimate(item); setTimeout(() => issueDocument("estimate"), 200); }}>見積書</button>
                <button className="purple" onClick={() => { restoreEstimate(item); setTimeout(() => issueDocument("invoice"), 200); }}>請求書</button>
                <button className="danger" onClick={() => deleteEstimate(item.id)}>削除</button>
              </div>
            </div>
          ))}
        </section>
      </main>

      {toast && (
        <div className="toast show">
          <strong>{toast.title}</strong>
          <span>{toast.sub}</span>
        </div>
      )}

      <section className="paper">
        {paper && (
          <>
            <div className="paper-head">
              <h1>{paper.title}</h1>
              <div className="paper-meta">
                <p>発行日：{paper.date}</p>
                <p>No. {paper.no}</p>
              </div>
            </div>
            <div className="paper-to">
              <strong>{paper.customer}</strong>
              <span>下記の通りご案内申し上げます。</span>
            </div>
            <div className="paper-issuer">
              <strong>{paper.issuer}</strong>
              {paper.stampImage ? <img className="paper-stamp" src={paper.stampImage} alt="印影" /> : null}
            </div>
            <div className="paper-total">
              <span>{paper.totalLabel}</span>
              <strong>{yen(paper.total)}</strong>
            </div>
            <table>
              <tbody>
                <tr><th>現場名</th><td>{paper.siteName}</td></tr>
                <tr><th>元請</th><td>{paper.client}</td></tr>
                <tr><th>工事項目</th><td>{paper.workName}</td></tr>
                <tr><th>施工面積</th><td>{paper.area}㎡</td></tr>
                <tr><th>見積単価</th><td>{yen(paper.unitPrice)}/㎡</td></tr>
                <tr><th>税抜金額</th><td>{yen(paper.salesBeforeDiscount)}</td></tr>
                <tr><th>値引き</th><td>{paper.discountAmount ? `-${yen(paper.discountAmount)}` : "0円"}</td></tr>
                <tr><th>消費税</th><td>{yen(paper.tax)}</td></tr>
                <tr><th>税込合計</th><td>{yen(paper.total)}</td></tr>
                {paper.kind === "invoice" && <tr><th>支払期限</th><td>{paper.paymentDue || "未設定"}</td></tr>}
                {paper.kind === "invoice" && <tr><th>振込先</th><td>{paper.bankInfo || "未設定"}</td></tr>}
              </tbody>
            </table>
            <table className="paper-items">
              <thead><tr><th>摘要</th><th>数量</th><th>単価</th><th>金額</th></tr></thead>
              <tbody>
                <tr><td>{paper.workName} 施工</td><td>{paper.area}㎡</td><td>{yen(paper.unitPrice)}/㎡</td><td>{yen(paper.salesBeforeDiscount)}</td></tr>
                {paper.discountAmount ? <tr><td>値引き</td><td>1式</td><td>-</td><td>-{yen(paper.discountAmount)}</td></tr> : null}
              </tbody>
            </table>
            <p className="paper-note">{paper.note}</p>
          </>
        )}
      </section>
    </>
  );
}

function Label({ title, children }) {
  return <label>{title}{children}</label>;
}

function Input({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label>{label}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NumberInput({ label, unit, value, onChange }) {
  return (
    <label>{label}
      <div className="unit-input">
        <input type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
        <span>{unit}</span>
      </div>
    </label>
  );
}

function NumberBasic({ label, value, onChange }) {
  return <label>{label}<input type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Outsource({ label, unit, setUnit, ninkou, setNinkou }) {
  return (
    <label>{label}
      <div className="sub-row">
        <input type="number" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <span>円/人工 ×</span>
        <input type="number" step="0.5" value={ninkou} onChange={(e) => setNinkou(e.target.value)} />
        <span>人工</span>
      </div>
    </label>
  );
}

function Mini({ title, value }) {
  return <div className="mini"><span>{title}</span><strong>{value}</strong></div>;
}

function Row({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

const $ = (id) => document.getElementById(id);
const yen = (n) => Math.round(Number(n)||0).toLocaleString("ja-JP") + "円";
const pct = (n) => ((Number(n)||0)*100).toFixed(1) + "%";

const defaultClients = [
  {id:"branchone", name:"BRANCHONE", sp:230, aa:415, cf:1530, floor:1200, sheet:1800, fixed:true},
  {id:"bluerino", name:"ブルリノベ", sp:235, aa:425, cf:1600, floor:1250, sheet:1850, fixed:true},
  {id:"house", name:"ハウスメンテナンス", sp:240, aa:430, cf:1580, floor:1280, sheet:1850, fixed:true},
  {id:"other", name:"その他", sp:230, aa:415, cf:1530, floor:1200, sheet:1800, fixed:true}
];

const labels = {sp:"クロス SP", aa:"クロス AA", cf:"CF", floor:"フロアタイル", sheet:"シート"};

function loadClients(){
  const saved = JSON.parse(localStorage.getItem("rieki_clients_v3") || "[]");
  const merged = [...defaultClients];
  saved.forEach(c => {
    if(!merged.some(x => x.id === c.id)) merged.push(c);
  });
  return merged;
}
function saveCustomClients(clients){
  localStorage.setItem("rieki_clients_v3", JSON.stringify(clients.filter(c => !c.fixed)));
}
let clients = loadClients();

function n(id){ return Number($(id).value) || 0; }
function currentClient(){ return clients.find(c => c.id === $("client").value) || clients[0]; }

function renderClientOptions(){
  const current = $("client").value || clients[0].id;
  $("client").innerHTML = clients.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  $("client").value = clients.some(c => c.id === current) ? current : clients[0].id;
}

function renderClientTable(){
  $("clientTable").innerHTML = `
    <div>元請</div><div>SP</div><div>AA</div><div>CF</div><div>床</div><div>シート</div>
    ${clients.map(c => `<div>${c.name}</div><div>${c.sp}</div><div>${c.aa}</div><div>${c.cf}</div><div>${c.floor}</div><div>${c.sheet}</div>`).join("")}
  `;
}

function materialUnit(){
  const c = currentClient();
  const type = $("workType").value;
  if(type === "sp") return Number(c.sp)||0;
  if(type === "aa") return Number(c.aa)||0;
  if(type === "cf") return Number(c.cf)||0;
  if(type === "floor") return Number(c.floor)||0;
  return Number(c.sheet)||0;
}

function currentCalc(){
  const type = $("workType").value;
  const area = n("area");
  const unit = materialUnit();
  const labor = n("labor");
  const unitPrice = unit + labor;
  const salesBeforeDiscount = unitPrice * area;
  const discount = n("discount");
  const sales = Math.max(0, salesBeforeDiscount - discount);
  const materialCost = unit * area;
  const suppliesCost = n("supplies") * area;
  const puttyCost = type === "sp" || type === "aa" ? n("putty") * area : 0;
  const disposalCost = n("disposal") * area;
  const travelCost = n("fuelKm") ? n("distance") / n("fuelKm") * n("fuelPrice") * n("trips") : 0;
  const crossOutCost = n("crossOutUnit") * n("crossOutNinkou");
  const cfOutCost = n("cfOutUnit") * n("cfOutNinkou");
  const floorOutCost = n("floorOutUnit") * n("floorOutNinkou");
  const sheetOutCost = n("sheetOutUnit") * n("sheetOutNinkou");
  const outsourcing = crossOutCost + cfOutCost + floorOutCost + sheetOutCost;
  const cost = materialCost + suppliesCost + puttyCost + disposalCost + travelCost + outsourcing;
  const profit = sales - cost;
  const profitRate = sales ? profit / sales : 0;
  const taxSales = sales * 1.1;
  const target = n("targetRate") / 100;
  const judge = profitRate >= target ? "OK" : "要調整";
  return {type,area,unitPrice,salesBeforeDiscount,discount,sales,materialCost,suppliesCost,puttyCost,disposalCost,travelCost,outsourcing,crossOutCost,cfOutCost,floorOutCost,sheetOutCost,cost,profit,profitRate,taxSales,judge};
}

function render(){
  const r = currentCalc();
  $("mainProfit").textContent = yen(r.profit);
  $("mainRate").textContent = "利益率 " + pct(r.profitRate);
  $("sales").textContent = yen(r.sales);
  $("cost").textContent = yen(r.cost);
  $("unitPrice").textContent = yen(r.unitPrice) + "/㎡";
  $("materialCost").textContent = yen(r.materialCost);
  $("suppliesCost").textContent = yen(r.suppliesCost);
  $("puttyCost").textContent = yen(r.puttyCost);
  $("disposalCost").textContent = yen(r.disposalCost);
  $("travelCost").textContent = yen(r.travelCost);
  $("outsourcingCost").textContent = yen(r.outsourcing);
  $("discountCost").textContent = "-" + yen(r.discount);
  $("crossOutCost").textContent = yen(r.crossOutCost);
  $("cfOutCost").textContent = yen(r.cfOutCost);
  $("floorOutCost").textContent = yen(r.floorOutCost);
  $("sheetOutCost").textContent = yen(r.sheetOutCost);
  $("taxSales").textContent = yen(r.taxSales);
  $("judge").textContent = r.judge;
  $("judge").className = r.judge === "OK" ? "ok" : "ng";
}

["client","workType","area","distance","trips","discount","crossOutUnit","crossOutNinkou","cfOutUnit","cfOutNinkou","floorOutUnit","floorOutNinkou","sheetOutUnit","sheetOutNinkou","labor","supplies","putty","disposal","fuelKm","fuelPrice","targetRate"]
.forEach(id => $(id).addEventListener("input", render));
$("client").addEventListener("change", render);
$("workType").addEventListener("change", render);

$("addClientBtn").addEventListener("click", () => {
  const name = $("newClientName").value.trim();
  if(!name){ alert("元請名を入力してください"); return; }
  const id = "client_" + Date.now();
  const c = {
    id,
    name,
    sp:n("newSp"),
    aa:n("newAa"),
    cf:n("newCf"),
    floor:n("newFloor"),
    sheet:n("newSheet"),
    fixed:false
  };
  clients.push(c);
  saveCustomClients(clients);
  renderClientOptions();
  $("client").value = id;
  renderClientTable();
  render();
  $("newClientName").value = "";
});

$("deleteClientBtn").addEventListener("click", () => {
  const c = currentClient();
  if(c.fixed){ alert("初期登録の元請は削除できません"); return; }
  if(!confirm(`${c.name} を削除しますか？`)) return;
  clients = clients.filter(x => x.id !== c.id);
  saveCustomClients(clients);
  renderClientOptions();
  renderClientTable();
  render();
});

function nextEstimateNo(){
  const current = Number(localStorage.getItem("rieki_estimate_no_v12") || "0") + 1;
  localStorage.setItem("rieki_estimate_no_v12", String(current));
  return String(current).padStart(5, "0");
}

function showToast(title, sub){
  $("toastTitle").textContent = title;
  $("toastSub").textContent = sub;
  $("toast").classList.add("show");
  if(navigator.vibrate) navigator.vibrate(80);
  setTimeout(() => $("toast").classList.remove("show"), 2200);
}

function getHistory(){
  return JSON.parse(localStorage.getItem("rieki_history_v12") || "[]");
}

function setHistory(data){
  localStorage.setItem("rieki_history_v12", JSON.stringify(data.slice(-100)));
}

function loadHistory(){
  const all = getHistory();
  const q = ($("historySearch")?.value || "").trim().toLowerCase();
  const data = q ? all.filter(item => 
    (item.siteName || "").toLowerCase().includes(q) ||
    (item.client || "").toLowerCase().includes(q) ||
    (item.name || "").toLowerCase().includes(q)
  ) : all;

  const box = $("historyList");
  if(!data.length){
    box.className="empty";
    box.textContent = all.length ? "検索に該当する見積がありません" : "まだ登録はありません";
    return;
  }

  box.className="";
  box.innerHTML = data.slice().reverse().map(item => `
    <div class="history-item">
      <div class="history-top">
        <div>
          <div class="history-title">${item.siteName || "現場名なし"}</div>
          <div class="history-meta">${item.client} / ${item.name} / ${item.area}㎡<br>${item.date}</div>
        </div>
        <div class="history-no">No.${item.no}</div>
      </div>
      <div class="history-money">
        <div><span>売上</span><strong>${yen(item.sales)}</strong></div>
        <div><span>利益</span><strong>${yen(item.profit)}</strong></div>
        <div><span>利益率</span><strong>${pct(item.profitRate)}</strong></div>
        <div><span>税込</span><strong>${yen(item.sales * 1.1)}</strong></div>
      </div>
      <div class="history-actions four">
        <button type="button" class="pdf" onclick="restoreEstimate('${item.id}')">開く</button>
        <button type="button" class="save" onclick="restoreAndIssue('${item.id}','estimate')">見積書</button>
        <button type="button" class="invoice" onclick="restoreAndIssue('${item.id}','invoice')">請求書</button>
        <button type="button" class="danger" onclick="deleteEstimate('${item.id}')">削除</button>
      </div>
    </div>
  `).join("");
}

function restoreEstimate(id){
  const item = getHistory().find(x => x.id === id);
  if(!item) return;
  $("siteName").value = item.siteName || "";
  $("siteMemo").value = item.siteMemo || "";
  if(item.clientId && clients.some(c => c.id === item.clientId)) $("client").value = item.clientId;
  $("workType").value = item.type;
  $("area").value = item.area;
  $("distance").value = item.distance;
  $("trips").value = item.trips;
  $("discount").value = item.discount || 0;
  if(item.outsource){
    $("crossOutUnit").value = item.outsource.crossUnit;
    $("crossOutNinkou").value = item.outsource.crossNinkou;
    $("cfOutUnit").value = item.outsource.cfUnit;
    $("cfOutNinkou").value = item.outsource.cfNinkou;
    $("floorOutUnit").value = item.outsource.floorUnit;
    $("floorOutNinkou").value = item.outsource.floorNinkou;
    $("sheetOutUnit").value = item.outsource.sheetUnit;
    $("sheetOutNinkou").value = item.outsource.sheetNinkou;
  }
  render();
  window.scrollTo({top:0, behavior:"smooth"});
  showToast("見積を開きました", `No.${item.no} ${item.siteName || ""}`);
}

function restoreAndIssue(id, kind){
  restoreEstimate(id);
  setTimeout(() => issueDocument(kind), 300);
}

function deleteEstimate(id){
  const data = getHistory();
  const item = data.find(x => x.id === id);
  if(!item) return;
  if(!confirm(`No.${item.no} ${item.siteName || "現場名なし"} を削除しますか？`)) return;
  setHistory(data.filter(x => x.id !== id));
  loadStamp();
loadHistory();
  showToast("削除しました", `No.${item.no}`);
}

$("saveBtn").addEventListener("click", () => {
  const siteName = $("siteName").value.trim();
  if(!siteName){
    alert("現場名を入力してください。保存後に見つけやすくなります。");
    $("siteName").focus();
    return;
  }

  const r = currentCalc();
  const data = getHistory();
  const no = nextEstimateNo();
  const id = "estimate_" + Date.now();

  data.push({
    id,
    no,
    date: new Date().toLocaleString("ja-JP"),
    siteName,
    siteMemo: $("siteMemo").value.trim(),
    client: currentClient().name,
    clientId: currentClient().id,
    name: labels[r.type],
    type: r.type,
    area: r.area,
    distance: n("distance"),
    trips: n("trips"),
    sales: r.sales,
    discount: r.discount,
    profit: r.profit,
    profitRate: r.profitRate,
    outsource:{
      crossUnit:n("crossOutUnit"), crossNinkou:n("crossOutNinkou"),
      cfUnit:n("cfOutUnit"), cfNinkou:n("cfOutNinkou"),
      floorUnit:n("floorOutUnit"), floorNinkou:n("floorOutNinkou"),
      sheetUnit:n("sheetOutUnit"), sheetNinkou:n("sheetOutNinkou")
    }
  });

  setHistory(data);
  loadHistory();
  showToast("見積を登録しました", `見積 No.${no} / ${siteName}`);
});

$("historySearch").addEventListener("input", loadHistory);
$("clearHistoryBtn").addEventListener("click", () => {
  if(!confirm("見積履歴をすべて削除しますか？")) return;
  localStorage.removeItem("rieki_history_v12");
  loadHistory();
  showToast("履歴を削除しました", "見積一覧を空にしました");
});


// ===== 印影設定 =====
function loadStamp(){
  const stamp = localStorage.getItem("rieki_stamp_image_v15");
  if(stamp){
    $("stampPreview").src = stamp;
    $("stampPreview").style.display = "block";
  }
}

function setStampStatus(msg){
  if($("stampStatus")) $("stampStatus").textContent = msg;
}

function compressStamp(file, maxSize=600, quality=0.82){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if(width > height && width > maxSize){
          height = Math.round(height * maxSize / width);
          width = maxSize;
        }else if(height >= width && height > maxSize){
          width = Math.round(width * maxSize / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0,0,width,height);
        ctx.drawImage(img,0,0,width,height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("画像を読み込めませんでした"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("ファイルを読み込めませんでした"));
    reader.readAsDataURL(file);
  });
}

async function registerStampFromFileInput(input){
  const file = input.files && input.files[0];
  if(!file){
    setStampStatus("画像が選択されていません。");
    return;
  }

  try{
    setStampStatus("印影を読み込み中です…");
    const dataUrl = await compressStamp(file);
    localStorage.setItem("rieki_stamp_image_v15", dataUrl);
    $("stampPreview").src = dataUrl;
    $("stampPreview").style.display = "block";
    setStampStatus("印影を登録しました。見積書・請求書に表示されます。");
    showToast("印影を登録しました", "見積書・請求書に表示されます");
  }catch(e){
    console.error(e);
    setStampStatus("登録失敗：別の画像で試すか、スクショした印影画像で試してください。");
    alert("印影の登録に失敗しました。別の画像、またはスクショした画像で試してください。");
  }
}

$("stampImageInput").addEventListener("change", (e) => registerStampFromFileInput(e.target));
$("stampCameraInput").addEventListener("change", (e) => registerStampFromFileInput(e.target));

$("clearStampBtn").addEventListener("click", () => {
  localStorage.removeItem("rieki_stamp_image_v15");
  $("stampPreview").removeAttribute("src");
  $("stampPreview").style.display = "none";
  setStampStatus("印影を削除しました。");
  showToast("印影を削除しました", "書類には表示されません");
});

function docNo(prefix, fieldId){
  const entered = $(fieldId).value.trim();
  if(entered) return entered;
  const d = new Date();
  const ymd = d.getFullYear().toString()
    + String(d.getMonth()+1).padStart(2,"0")
    + String(d.getDate()).padStart(2,"0");
  const no = String(Number(localStorage.getItem("rieki_doc_no_v13") || "0") + 1).padStart(4, "0");
  localStorage.setItem("rieki_doc_no_v13", String(Number(no)));
  return `${prefix}-${ymd}-${no}`;
}

function buildPaperItems(r){
  const rows = [
    [`${labels[r.type]} 施工`, `${r.area}㎡`, `${yen(r.unitPrice)}/㎡`, yen(r.salesBeforeDiscount)]
  ];
  if(r.discount){
    rows.push(["値引き", "1式", "-", "-" + yen(r.discount)]);
  }

  const html = rows.map(row => `
    <tr>
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${row[3]}</td>
    </tr>
  `).join("");

  $("paperItems").innerHTML = html;
}

function issueDocument(kind){
  const r = currentCalc();
  const isInvoice = kind === "invoice";
  const siteName = $("siteName").value.trim() || "未入力";
  const customer = $("customerName").value.trim() || currentClient().name + " 御中";
  const issuer = $("issuerName").value.trim() || "発行者未入力";
  const no = isInvoice ? docNo("INV", "invoiceDocNo") : docNo("EST", "estimateDocNo");

  $("paperTitle").textContent = isInvoice ? "御請求書" : "御見積書";
  $("paperDate").textContent = "発行日：" + new Date().toLocaleDateString("ja-JP");
  $("paperDocNo").textContent = "No. " + no;
  $("paperCustomer").textContent = customer;
  $("paperIssuer").textContent = issuer;

  const stamp = localStorage.getItem("rieki_stamp_image_v15");
  if(stamp){
    $("paperStamp").src = stamp;
    $("paperStamp").style.display = "block";
  }else{
    $("paperStamp").removeAttribute("src");
    $("paperStamp").style.display = "none";
  }

  $("paperTotalLabel").textContent = isInvoice ? "御請求金額" : "御見積金額";
  $("paperTotalBig").textContent = yen(r.taxSales);

  $("paperSiteName").textContent = siteName;
  $("paperClient").textContent = currentClient().name;
  $("paperWork").textContent = labels[r.type];
  $("paperArea").textContent = r.area + "㎡";
  $("paperUnit").textContent = yen(r.unitPrice) + "/㎡";
  $("paperSales").textContent = yen(r.salesBeforeDiscount);
  $("paperDiscount").textContent = r.discount ? "-" + yen(r.discount) : "0円";
  $("paperTax").textContent = yen(r.sales * 0.1);
  $("paperTotal").textContent = yen(r.taxSales);

  $("paymentDueRow").style.display = isInvoice ? "" : "none";
  $("bankRow").style.display = isInvoice ? "" : "none";
  $("paperPaymentDue").textContent = $("paymentDue").value || "未設定";
  $("paperBankInfo").textContent = $("bankInfo").value.trim() || "未設定";
  $("paperNote").textContent = isInvoice ? "上記の通り御請求申し上げます。" : "上記の通り御見積申し上げます。";

  buildPaperItems(r);
  window.print();
}

$("estimatePdfBtn").addEventListener("click", () => issueDocument("estimate"));
$("invoicePdfBtn").addEventListener("click", () => issueDocument("invoice"));


// ===== Google Maps API 距離計算 =====
let googleMapsLoaded = false;
let currentCoords = null;

function setMapStatus(msg){
  $("mapStatus").textContent = msg;
}

function saveApiKey(){
  const key = $("googleApiKey").value.trim();
  if(!key){
    setMapStatus("Google Maps APIキーを入力してください。");
    return;
  }
  localStorage.setItem("rieki_google_maps_api_key", key);
  setMapStatus("APIキーを保存しました。次に出発地と現場住所を入れて距離を計算してください。");
}

function loadSavedApiKey(){
  const key = localStorage.getItem("rieki_google_maps_api_key") || "";
  $("googleApiKey").value = key;
}

function loadGoogleMaps(){
  return new Promise((resolve, reject) => {
    if(window.google && google.maps){
      googleMapsLoaded = true;
      resolve();
      return;
    }

    const key = $("googleApiKey").value.trim() || localStorage.getItem("rieki_google_maps_api_key");
    if(!key){
      reject(new Error("APIキーがありません"));
      return;
    }

    const existing = document.getElementById("googleMapsScript");
    if(existing){
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Mapsを読み込めませんでした")));
      return;
    }

    window.__initRiekiMaps = () => {
      googleMapsLoaded = true;
      resolve();
    };

    const script = document.createElement("script");
    script.id = "googleMapsScript";
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(key) + "&callback=__initRiekiMaps&libraries=routes";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Mapsを読み込めませんでした"));
    document.head.appendChild(script);
  });
}

function googleMapUrl(){
  const site = $("siteAddress").value.trim();
  const origin = $("originAddress").value.trim();
  return "https://www.google.com/maps/dir/?api=1"
    + "&origin=" + encodeURIComponent(origin === "現在地" ? "" : origin)
    + "&destination=" + encodeURIComponent(site)
    + "&travelmode=driving";
}

$("saveApiKeyBtn").addEventListener("click", saveApiKey);

$("currentLocationBtn").addEventListener("click", () => {
  if(!navigator.geolocation){
    setMapStatus("この端末では現在地取得が使えません。出発地を手入力してください。");
    return;
  }
  setMapStatus("現在地を取得中です…");
  navigator.geolocation.getCurrentPosition(
    pos => {
      currentCoords = {lat: pos.coords.latitude, lng: pos.coords.longitude};
      $("originAddress").value = "現在地";
      setMapStatus("現在地を出発地に設定しました。現場住所を入れて距離を計算できます。");
    },
    () => setMapStatus("現在地を取得できませんでした。住所を手入力してください。"),
    {enableHighAccuracy:true, timeout:10000}
  );
});

$("mapDistanceBtn").addEventListener("click", async () => {
  const site = $("siteAddress").value.trim();
  const originText = $("originAddress").value.trim();

  if(!site){
    setMapStatus("現場住所を入力してください。");
    return;
  }
  if(!originText){
    setMapStatus("出発地を入力するか、現在地を使ってください。");
    return;
  }

  try{
    setMapStatus("Google Maps APIで走行距離を計算中です…");
    await loadGoogleMaps();

    const origin = originText === "現在地" && currentCoords ? currentCoords : originText;

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [site],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    }, (response, status) => {
      if(status !== "OK"){
        setMapStatus("Google Maps APIの距離計算に失敗しました。API設定を確認してください。");
        return;
      }

      const element = response.rows?.[0]?.elements?.[0];
      if(!element || element.status !== "OK"){
        setMapStatus("ルートが見つかりませんでした。住所を詳しく入力してください。");
        return;
      }

      const km = element.distance.value / 1000;
      $("distance").value = km.toFixed(1);
      setMapStatus(`走行距離 ${km.toFixed(1)}km を自動反映しました。`);
      render();
    });
  }catch(e){
    setMapStatus("APIキーが未設定、またはGoogle Maps APIを読み込めません。APIキーと請求設定を確認してください。");
  }
});

$("openMapBtn").addEventListener("click", () => {
  const site = $("siteAddress").value.trim();
  if(!site){ setMapStatus("現場住所を入力してください。"); return; }
  window.open(googleMapUrl(), "_blank");
});

$("reflectDistanceBtn").addEventListener("click", () => {
  const km = Number($("mapManualDistance").value);
  if(!km || km <= 0){
    setMapStatus("MAPで見た距離を入力してください。例：18.5");
    return;
  }
  $("distance").value = km;
  setMapStatus(`走行距離に ${km}km を反映しました。交通費も再計算済みです。`);
  render();
});

loadSavedApiKey();


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

renderClientOptions();
renderClientTable();
render();
loadHistory();

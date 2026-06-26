"use client";

import { useEffect, useState } from "react";

const yen = (n) => `¥${Number(n || 0).toLocaleString()}`;

const WORK_TYPES = ["クロス SP", "クロス AA", "CF", "フロアタイル", "シート"];

const WORK_TYPE_FIELD = {
  "クロス SP": "sp",
  "クロス AA": "aa",
  CF: "cf",
  フロアタイル: "floor",
  シート: "sheet",
};

const PRICE_FIELDS = [
  { key: "sp", label: "SP 円/㎡" },
  { key: "aa", label: "AA 円/㎡" },
  { key: "cf", label: "CF 円/㎡" },
  { key: "floor", label: "フロア 円/㎡" },
  { key: "sheet", label: "シート 円/㎡" },
];

const DEFAULT_CLIENTS = [
  { id: 1, name: "BRANCHONE", sp: 230, aa: 415, cf: 150, floor: 650, sheet: 800 },
  { id: 2, name: "ブルリノベ", sp: 230, aa: 415, cf: 150, floor: 650, sheet: 800 },
];

const DEFAULT_COMPANY = {
  name: "有限会社 利益内装",
  address: "〒000-0000 東京都○○区○○ 1-2-3",
  tel: "03-0000-0000",
  representative: "代表取締役 山田 太郎",
};

function getEstimateLine(estimate) {
  const unitPrice =
    estimate.unitPrice ?? (estimate.area ? estimate.sales / estimate.area : 0);
  const discount = estimate.discount ?? 0;
  const lineAmount = estimate.area * unitPrice;
  return { unitPrice, discount, lineAmount };
}

function getMaterialForClient(clients, clientName, workType) {
  const c = clients.find((x) => x.name === clientName);
  if (!c) return 0;
  const field = WORK_TYPE_FIELD[workType];
  return field ? Number(c[field] || 0) : 0;
}

function emptyClientForm() {
  return { name: "", sp: 230, aa: 415, cf: 150, floor: 650, sheet: 800 };
}

export default function Page() {
  const [screen, setScreen] = useState("home");
  const [estimates, setEstimates] = useState([]);
  const [clients, setClients] = useState(DEFAULT_CLIENTS);
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [pdfEstimate, setPdfEstimate] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  useEffect(() => {
    const savedEstimates = localStorage.getItem("rieki-estimates");
    if (savedEstimates) setEstimates(JSON.parse(savedEstimates));

    const savedClients = localStorage.getItem("rieki-clients");
    if (savedClients) {
      const parsed = JSON.parse(savedClients);
      setClients(
        parsed.map((c, i) => ({
          ...c,
          id: c.id ?? Date.now() + i,
        }))
      );
    }

    const savedCompany = localStorage.getItem("rieki-company");
    if (savedCompany) setCompany(JSON.parse(savedCompany));
  }, []);

  useEffect(() => {
    const clearPdf = () => {
      setPdfEstimate(null);
      setShouldPrint(false);
    };
    window.addEventListener("afterprint", clearPdf);
    return () => window.removeEventListener("afterprint", clearPdf);
  }, []);

  useEffect(() => {
    if (!pdfEstimate || !shouldPrint) return;
    requestAnimationFrame(() => window.print());
  }, [pdfEstimate, shouldPrint]);

  const saveAll = (next) => {
    setEstimates(next);
    localStorage.setItem("rieki-estimates", JSON.stringify(next));
  };

  const saveClients = (next) => {
    setClients(next);
    localStorage.setItem("rieki-clients", JSON.stringify(next));
  };

  const handlePdfOutput = (estimate) => {
    setPdfEstimate(estimate);
    setShouldPrint(true);
  };

  let content;

  if (screen === "new") {
    content = (
      <EstimateForm
        clients={clients}
        onBack={() => setScreen("home")}
        onSave={(e) => {
          saveAll([e, ...estimates]);
          setScreen("list");
        }}
        onPdf={handlePdfOutput}
      />
    );
  } else if (screen === "list") {
    content = (
      <EstimateList
        estimates={estimates}
        onBack={() => setScreen("home")}
        onDelete={(id) => {
          saveAll(estimates.filter((e) => e.id !== id));
        }}
        onPdf={handlePdfOutput}
      />
    );
  } else if (screen === "pdf") {
    content = (
      <PdfEstimateList
        estimates={estimates}
        onBack={() => setScreen("home")}
        onPdf={handlePdfOutput}
      />
    );
  } else if (screen === "clients") {
    content = (
      <ClientManager
        clients={clients}
        onBack={() => setScreen("home")}
        onSave={saveClients}
      />
    );
  } else {
    content = (
      <main style={s.page}>
        <p style={s.kicker}>職人のための見積・利益管理</p>
        <h1 style={s.title}>利益職人</h1>
        <p style={s.sub}>β0.6 PDF見積書</p>

        <section style={s.card}>
          <p>保存済み見積</p>
          <h2>{estimates.length}件</h2>
        </section>

        <section style={s.miniCard}>
          <p style={s.muted}>登録元請</p>
          <h2 style={s.miniCount}>{clients.length}社</h2>
        </section>

        <button style={s.btn} onClick={() => setScreen("new")}>＋ 新しい見積</button>
        <button style={s.btn} onClick={() => setScreen("list")}>📂 見積一覧</button>
        <button style={s.btn} onClick={() => setScreen("pdf")}>📄 PDF見積書</button>
        <button style={s.btn} onClick={() => setScreen("clients")}>👥 元請管理</button>
        <button style={s.btn}>⚙️ 設定</button>
      </main>
    );
  }

  return (
    <>
      <div className="no-print">{content}</div>
      {pdfEstimate && (
        <div className="paper">
          <EstimatePaper estimate={pdfEstimate} company={company} />
        </div>
      )}
    </>
  );
}

function ClientManager({ clients, onBack, onSave }) {
  const [form, setForm] = useState(emptyClientForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyClientForm());

  const updateForm = (setter) => (key, value) => {
    setter((prev) => ({ ...prev, [key]: value }));
  };

  const setFormField = updateForm(setForm);
  const setEditField = updateForm(setEditForm);

  const handleAdd = () => {
    const name = form.name.trim();
    if (!name) {
      alert("元請名を入力してください。");
      return;
    }
    if (clients.some((c) => c.name === name)) {
      alert("同じ名前の元請が既に登録されています。");
      return;
    }
    onSave([...clients, { ...form, name, id: Date.now() }]);
    setForm(emptyClientForm());
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setEditForm({ ...client });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyClientForm());
  };

  const handleUpdate = () => {
    const name = editForm.name.trim();
    if (!name) {
      alert("元請名を入力してください。");
      return;
    }
    if (clients.some((c) => c.name === name && c.id !== editingId)) {
      alert("同じ名前の元請が既に登録されています。");
      return;
    }
    onSave(
      clients.map((c) =>
        c.id === editingId ? { ...editForm, name, id: editingId } : c
      )
    );
    cancelEdit();
  };

  const handleDelete = (client) => {
    if (!window.confirm(`「${client.name}」を削除しますか？`)) return;
    onSave(clients.filter((c) => c.id !== client.id));
    if (editingId === client.id) cancelEdit();
  };

  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>元請管理</h1>
      <p style={s.sub}>工種別の材料単価を登録・編集できます</p>

      <section style={s.listCard}>
        <h2 style={s.sectionTitle}>＋ 元請を追加</h2>
        <div style={s.form}>
          <Input label="元請名" value={form.name} setValue={(v) => setFormField("name", v)} />
          <div style={s.priceGrid}>
            {PRICE_FIELDS.map(({ key, label }) => (
              <Input
                key={key}
                label={label}
                value={form[key]}
                setValue={(v) => setFormField(key, v)}
                type="number"
              />
            ))}
          </div>
        </div>
        <button style={s.save} onClick={handleAdd}>追加する</button>
      </section>

      {clients.length === 0 ? (
        <p style={s.muted}>まだ元請が登録されていません。</p>
      ) : (
        clients.map((client) => (
          <section key={client.id} style={s.listCard}>
            {editingId === client.id ? (
              <>
                <h2 style={s.sectionTitle}>編集</h2>
                <div style={s.form}>
                  <Input label="元請名" value={editForm.name} setValue={(v) => setEditField("name", v)} />
                  <div style={s.priceGrid}>
                    {PRICE_FIELDS.map(({ key, label }) => (
                      <Input
                        key={key}
                        label={label}
                        value={editForm[key]}
                        setValue={(v) => setEditField(key, v)}
                        type="number"
                      />
                    ))}
                  </div>
                </div>
                <div style={s.rowActions}>
                  <button style={s.save} onClick={handleUpdate}>保存</button>
                  <button style={s.secondary} onClick={cancelEdit}>キャンセル</button>
                </div>
              </>
            ) : (
              <>
                <h2 style={s.sectionTitle}>{client.name}</h2>
                <div style={s.priceList}>
                  {PRICE_FIELDS.map(({ key, label }) => (
                    <p key={key} style={s.priceRow}>
                      <span style={s.muted}>{label}</span>
                      <span>{yen(client[key])}</span>
                    </p>
                  ))}
                </div>
                <div style={s.rowActions}>
                  <button style={s.secondary} onClick={() => startEdit(client)}>編集</button>
                  <button style={s.delete} onClick={() => handleDelete(client)}>削除</button>
                </div>
              </>
            )}
          </section>
        ))
      )}
    </main>
  );
}

function EstimateForm({ clients, onBack, onSave, onPdf }) {
  const defaultClient = clients[0]?.name || "";
  const [siteName, setSiteName] = useState("");
  const [client, setClient] = useState(defaultClient);
  const [workType, setWorkType] = useState("クロス SP");
  const [area, setArea] = useState(100);
  const [unitPrice, setUnitPrice] = useState(1800);
  const [material, setMaterial] = useState(() =>
    getMaterialForClient(clients, defaultClient, "クロス SP")
  );
  const [labor, setLabor] = useState(23000);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!clients.some((c) => c.name === client) && clients[0]) {
      setClient(clients[0].name);
      return;
    }
    setMaterial(getMaterialForClient(clients, client, workType));
  }, [clients, client, workType]);

  const clientOptions = clients.map((c) => c.name);
  const sales = area * unitPrice - discount;
  const cost = area * material + labor;
  const profit = sales - cost;
  const rate = sales > 0 ? (profit / sales) * 100 : 0;

  const buildEstimate = () => ({
    id: Date.now(),
    siteName: siteName || "名称未設定",
    client,
    workType,
    area,
    unitPrice,
    material,
    labor,
    discount,
    sales,
    cost,
    profit,
    rate,
    createdAt: new Date().toLocaleString("ja-JP"),
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
      <h1 style={s.title}>見積作成</h1>

      <section style={s.card}>
        <p>見積利益</p>
        <h2>{yen(profit)}</h2>
        <p>利益率 {rate.toFixed(1)}%</p>
      </section>

      <div style={s.form}>
        <Input label="現場名" value={siteName} setValue={setSiteName} />
        <Select label="元請" value={client} setValue={setClient} options={clientOptions} />
        <Select label="工事項目" value={workType} setValue={setWorkType} options={WORK_TYPES} />
        <Input label="施工面積㎡" value={area} setValue={setArea} type="number" />
        <Input label="請負単価 円/㎡" value={unitPrice} setValue={setUnitPrice} type="number" />
        <Input label="材料費 円/㎡" value={material} setValue={setMaterial} type="number" />
        <Input label="外注費 円" value={labor} setValue={setLabor} type="number" />
        <Input label="値引き 円" value={discount} setValue={setDiscount} type="number" />
      </div>

      <section style={s.result}>
        <p>売上：{yen(sales)}</p>
        <p>原価：{yen(cost)}</p>
        <p>利益：{yen(profit)}</p>
        <p>利益率：{rate.toFixed(1)}%</p>
      </section>

      <div style={s.formActions}>
        <button style={s.pdf} onClick={() => onPdf(buildEstimate())}>
          📄 PDF出力
        </button>
        <button style={s.save} onClick={() => onSave(buildEstimate())}>
          💾 保存する
        </button>
      </div>
    </main>
  );
}

function PdfEstimateList({ estimates, onBack, onPdf }) {
  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>PDF見積書</h1>
      <p style={s.sub}>A4縦・印刷に最適化された見積書を出力できます</p>

      {estimates.length === 0 ? (
        <p style={s.muted}>保存済みの見積がありません。先に見積を作成・保存してください。</p>
      ) : (
        estimates.map((e) => (
          <section key={e.id} style={s.listCard}>
            <h2 style={s.sectionTitle}>{e.siteName}</h2>
            <p>{e.client} / {e.workType}</p>
            <p>合計：{yen(e.sales)}</p>
            <p>利益：{yen(e.profit)}（{e.rate.toFixed(1)}%）</p>
            <small>{e.createdAt}</small>
            <button style={{ ...s.pdf, width: "100%", marginTop: 12 }} onClick={() => onPdf(e)}>
              📄 PDF出力
            </button>
          </section>
        ))
      )}
    </main>
  );
}

function EstimateList({ estimates, onBack, onDelete, onPdf }) {
  return (
    <main style={s.page}>
      <button style={s.back} onClick={onBack}>← 戻る</button>
      <h1 style={s.title}>見積一覧</h1>

      {estimates.length === 0 ? (
        <p>まだ保存はありません。</p>
      ) : (
        estimates.map((e) => (
          <section key={e.id} style={s.listCard}>
            <h2>{e.siteName}</h2>
            <p>
              {e.client} / {e.workType}
            </p>
            <p>売上：{yen(e.sales)}</p>
            <p>利益：{yen(e.profit)}</p>
            <p>利益率：{e.rate.toFixed(1)}%</p>
            <small>{e.createdAt}</small>
            <div style={s.rowActions}>
              <button style={s.pdf} onClick={() => onPdf(e)}>
                📄 PDF出力
              </button>
              <button style={s.delete} onClick={() => onDelete(e.id)}>
                削除
              </button>
            </div>
          </section>
        ))
      )}
    </main>
  );
}

function EstimatePaper({ estimate, company }) {
  const { unitPrice, discount, lineAmount } = getEstimateLine(estimate);
  const estimateDate = estimate.createdAt?.split(" ")[0] || new Date().toLocaleDateString("ja-JP");

  return (
    <>
      <div className="paper-head">
        <h1>見 積 書</h1>
        <div className="paper-meta">
          <div>見積日：{estimateDate}</div>
          <div>見積No.：{String(estimate.id).slice(-8)}</div>
        </div>
      </div>

      <div className="paper-company">
        <strong>{company.name}</strong>
        {company.address}
        <br />
        TEL {company.tel}
        <br />
        {company.representative}
      </div>

      <div className="paper-to">
        <strong>{estimate.client} 御中</strong>
        <p className="paper-site">元請：{estimate.client}</p>
        <p className="paper-site">現場名：{estimate.siteName}</p>
      </div>

      <p>下記の通りお見積り申し上げます。</p>

      <table className="paper-items">
        <thead>
          <tr>
            <th>工事項目</th>
            <th>数量</th>
            <th>単価</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{estimate.workType}</td>
            <td>{estimate.area} ㎡</td>
            <td>{yen(unitPrice)}</td>
            <td>{yen(lineAmount)}</td>
          </tr>
          {discount > 0 && (
            <tr>
              <td>値引き</td>
              <td>—</td>
              <td>—</td>
              <td>-{yen(discount).replace("¥", "")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="paper-total">
        <span>合計（税込）</span>
        <strong>{yen(estimate.sales)}</strong>
      </div>

      <div className="paper-profit">
        <div>
          <span>利益</span>
          <span>{yen(estimate.profit)}</span>
        </div>
        <div>
          <span>利益率</span>
          <span>{estimate.rate.toFixed(1)}%</span>
        </div>
      </div>

      <p className="paper-note">
        ※ 本見積書の有効期限は発行日より30日間とさせていただきます。
        <br />
        ※ 工事内容の変更・追加が生じた場合は、別途お見積りいたします。
      </p>
    </>
  );
}

function Input({ label, value, setValue, type = "text" }) {
  return (
    <label style={s.label}>
      {label}
      <input
        style={s.input}
        type={type}
        value={value}
        onChange={(e) =>
          setValue(type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
    </label>
  );
}

function Select({ label, value, setValue, options }) {
  return (
    <label style={s.label}>
      {label}
      <select style={s.input} value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#111", color: "#fff", padding: 24, fontFamily: "sans-serif" },
  kicker: { color: "#ff8a00", fontWeight: 900 },
  title: { fontSize: 42, margin: "8px 0" },
  sub: { color: "#aaa", fontWeight: 700 },
  muted: { color: "#aaa", margin: 0 },
  card: { background: "#ff6a00", borderRadius: 24, padding: 24, margin: "24px 0" },
  miniCard: { background: "#1f1f1f", border: "1px solid #333", borderRadius: 20, padding: 18, marginBottom: 8 },
  miniCount: { margin: "8px 0 0", fontSize: 28 },
  btn: {
    width: "100%",
    padding: 18,
    marginTop: 12,
    borderRadius: 18,
    border: "1px solid #333",
    background: "#1f1f1f",
    color: "#fff",
    fontSize: 18,
    fontWeight: 900,
    textAlign: "left",
  },
  back: { padding: 12, borderRadius: 14, background: "#222", color: "#fff", border: "1px solid #333", fontWeight: 900 },
  form: { display: "grid", gap: 14 },
  label: { display: "grid", gap: 6, fontWeight: 900 },
  input: { padding: 16, borderRadius: 14, border: "1px solid #333", fontSize: 18 },
  result: { marginTop: 24, padding: 20, background: "#1f1f1f", borderRadius: 20, border: "1px solid #333", fontWeight: 900 },
  save: { width: "100%", marginTop: 12, padding: 18, borderRadius: 18, border: "none", background: "#ff6a00", color: "#fff", fontSize: 18, fontWeight: 900 },
  pdf: { flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", fontWeight: 900 },
  formActions: { display: "grid", gap: 10, marginTop: 20 },
  secondary: { flex: 1, padding: 12, borderRadius: 12, border: "1px solid #333", background: "#333", color: "#fff", fontWeight: 900 },
  listCard: { background: "#1f1f1f", border: "1px solid #333", borderRadius: 20, padding: 18, marginTop: 14 },
  sectionTitle: { margin: "0 0 12px", fontSize: 20 },
  priceGrid: { display: "grid", gap: 10 },
  priceList: { display: "grid", gap: 6, marginBottom: 12 },
  priceRow: { display: "flex", justifyContent: "space-between", margin: 0, fontWeight: 900 },
  rowActions: { display: "flex", gap: 10, marginTop: 8 },
  delete: { flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#8b0000", color: "#fff", fontWeight: 900 },
};

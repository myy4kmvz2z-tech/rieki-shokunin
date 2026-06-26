"use client";

import { useState } from "react";

export default function Page() {
  const [screen, setScreen] = useState("home");

  if (screen === "estimate") {
    return <EstimateScreen onBack={() => setScreen("home")} />;
  }

  return (
    <main style={styles.page}>
      <p style={styles.kicker}>職人のための見積・利益管理</p>
      <h1 style={styles.title}>利益職人</h1>
      <p style={styles.version}>β0.2 ホーム</p>

      <section style={styles.profitCard}>
        <p style={styles.cardLabel}>今日の利益</p>
        <h2 style={styles.profit}>¥0</h2>
        <p style={styles.cardLabel}>利益率 0.0%</p>
      </section>

      <section style={styles.menu}>
        <button style={styles.button} onClick={() => setScreen("estimate")}>
          ＋ 新しい見積
        </button>
        <button style={styles.button}>📂 見積一覧</button>
        <button style={styles.button}>👥 元請管理</button>
        <button style={styles.button}>⚙️ 設定</button>
      </section>
    </main>
  );
}

function EstimateScreen({ onBack }) {
  const [area, setArea] = useState(100);
  const [unitPrice, setUnitPrice] = useState(1800);
  const [material, setMaterial] = useState(355);
  const [labor, setLabor] = useState(23000);
  const [discount, setDiscount] = useState(0);

  const sales = area * unitPrice - discount;
  const cost = area * material + labor;
  const profit = sales - cost;
  const profitRate = sales > 0 ? (profit / sales) * 100 : 0;

  return (
    <main style={styles.page}>
      <button style={styles.backButton} onClick={onBack}>
        ← ホームへ戻る
      </button>

      <p style={styles.kicker}>新しい見積</p>
      <h1 style={styles.title}>見積作成</h1>

      <section style={styles.profitCard}>
        <p style={styles.cardLabel}>見積利益</p>
        <h2 style={styles.profit}>¥{profit.toLocaleString()}</h2>
        <p style={styles.cardLabel}>利益率 {profitRate.toFixed(1)}%</p>
      </section>

      <section style={styles.form}>
        <label style={styles.label}>
          現場名
          <input style={styles.input} placeholder="例：〇〇様邸 / △△マンション" />
        </label>

        <label style={styles.label}>
          元請
          <select style={styles.input}>
            <option>BRANCHONE</option>
            <option>ブルリノベ</option>
            <option>ハウスメンテナンス</option>
            <option>その他</option>
          </select>
        </label>

        <label style={styles.label}>
          工事項目
          <select style={styles.input}>
            <option>クロス SP</option>
            <option>クロス AA</option>
            <option>CF</option>
            <option>フロアタイル</option>
            <option>シート</option>
          </select>
        </label>

        <label style={styles.label}>
          施工面積 ㎡
          <input
            style={styles.input}
            type="number"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
          />
        </label>

        <label style={styles.label}>
          請負単価 円/㎡
          <input
            style={styles.input}
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
          />
        </label>

        <label style={styles.label}>
          材料費 円/㎡
          <input
            style={styles.input}
            type="number"
            value={material}
            onChange={(e) => setMaterial(Number(e.target.value))}
          />
        </label>

        <label style={styles.label}>
          外注費 円
          <input
            style={styles.input}
            type="number"
            value={labor}
            onChange={(e) => setLabor(Number(e.target.value))}
          />
        </label>

        <label style={styles.label}>
          値引き 円
          <input
            style={styles.input}
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </label>
      </section>

      <section style={styles.result}>
        <p>売上：¥{sales.toLocaleString()}</p>
        <p>原価：¥{cost.toLocaleString()}</p>
        <p>利益：¥{profit.toLocaleString()}</p>
        <p>利益率：{profitRate.toFixed(1)}%</p>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111",
    color: "white",
    padding: 24,
    fontFamily: "sans-serif",
  },
  kicker: {
    color: "#ff8a00",
    fontWeight: 800,
  },
  title: {
    fontSize: 44,
    margin: "8px 0",
  },
  version: {
    color: "#aaa",
    fontWeight: 700,
  },
  profitCard: {
    background: "#ff6a00",
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
  },
  cardLabel: {
    margin: 0,
    fontWeight: 800,
  },
  profit: {
    fontSize: 42,
    margin: "12px 0",
  },
  menu: {
    marginTop: 24,
    display: "grid",
    gap: 12,
  },
  button: {
    width: "100%",
    padding: 18,
    borderRadius: 18,
    border: "1px solid #333",
    background: "#1f1f1f",
    color: "white",
    fontSize: 18,
    fontWeight: 800,
    textAlign: "left",
  },
  backButton: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #333",
    background: "#222",
    color: "white",
    fontWeight: 800,
    marginBottom: 16,
  },
  form: {
    marginTop: 24,
    display: "grid",
    gap: 14,
  },
  label: {
    display: "grid",
    gap: 6,
    color: "#ddd",
    fontWeight: 800,
  },
  input: {
    padding: 16,
    borderRadius: 14,
    border: "1px solid #333",
    fontSize: 18,
  },
  result: {
    marginTop: 24,
    background: "#1f1f1f",
    border: "1px solid #333",
    borderRadius: 20,
    padding: 20,
    fontSize: 18,
    fontWeight: 800,
  },
};
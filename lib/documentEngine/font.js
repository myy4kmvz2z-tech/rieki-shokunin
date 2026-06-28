let fontBase64Promise = null;

export async function loadJapaneseFontBase64() {
  if (!fontBase64Promise) {
    fontBase64Promise = fetch("/fonts/NotoSansJP-Regular.otf").then(async (response) => {
      if (!response.ok) {
        throw new Error("PDF用フォントの読み込みに失敗しました。");
      }
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    });
  }
  return fontBase64Promise;
}

export async function createPdfDocument() {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const base64 = await loadJapaneseFontBase64();
  doc.addFileToVFS("NotoSansJP-Regular.otf", base64);
  doc.addFont("NotoSansJP-Regular.otf", "NotoSansJP", "normal");
  doc.setFont("NotoSansJP");
  return doc;
}

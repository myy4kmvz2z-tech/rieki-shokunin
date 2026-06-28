import "./globals.css";

export const metadata = {
  title: "利益職人",
  description: "職人のための見積・利益管理アプリ",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111111",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <div id="__next" className="app-root app-shell no-print">
          {children}
        </div>
      </body>
    </html>
  );
}

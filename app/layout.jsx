export const metadata = {
  title: "利益職人",
  description: "職人のための見積・利益管理アプリ",
  manifest: "/manifest.json",
  themeColor: "#111111",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

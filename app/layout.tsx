/* app/layout.tsx */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "X Ops (Local)",
  description: "Twitter/X運用の下書き・予定・実績をローカルで管理するMVP",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

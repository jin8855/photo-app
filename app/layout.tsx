import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createTranslator } from "@/lib/i18n/translate";

import "./globals.css";

const t = createTranslator("ko");

export const metadata: Metadata = {
  title: t("app.metadata.title"),
  description: t("app.metadata.description"),
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

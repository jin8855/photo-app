import Link from "next/link";
import type { CSSProperties } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { HistoryListView } from "@/features/history/components/history-list-view";
import { AnalysisStateCard } from "@/features/upload/components/analysis-state-card";
import { createTranslator } from "@/lib/i18n/translate";
import { createHistoryService } from "@/services/app/app-service-factory";

const t = createTranslator("ko");

const homeButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(64,47,30,0.08)",
  color: "#1f1b17",
  fontWeight: 700,
} satisfies CSSProperties;

export default async function HistoryPage() {
  try {
    const historyService = createHistoryService();
    const items = await historyService.listHistory();

    return (
      <AppShell
        title={t("historyPage.shell.badge")}
        subtitle={t("historyPage.shell.title")}
        actions={
          <Link href="/" style={homeButtonStyle}>
            {t("historyPage.homeButton")}
          </Link>
        }
      >
        {items.length === 0 ? (
          <AnalysisStateCard
            title={t("historyPage.states.emptyTitle")}
            description={t("historyPage.states.emptyDescription")}
          />
        ) : (
          <HistoryListView
            items={items}
            messages={{
              title: t("historyPage.list.title"),
              description: t("historyPage.list.description"),
              openDetail: t("historyPage.list.openDetail"),
              delete: t("historyPage.list.delete"),
              deleting: t("historyPage.list.deleting"),
              deleteConfirm: t("historyPage.list.deleteConfirm"),
              deleteFailed: t("historyPage.list.deleteFailed"),
              emptyAfterDeleteTitle: t("historyPage.states.emptyTitle"),
              emptyAfterDeleteDescription: t("historyPage.states.emptyDescription"),
              noAnalysis: t("historyPage.list.noAnalysis"),
              photoCreatedAt: t("historyPage.list.photoCreatedAt"),
              analysisCreatedAt: t("historyPage.list.analysisCreatedAt"),
              sceneType: t("historyPage.list.sceneType"),
              moodCategory: t("historyPage.list.moodCategory"),
            }}
          />
        )}
      </AppShell>
    );
  } catch {
    return (
      <AppShell
        title={t("historyPage.shell.badge")}
        subtitle={t("historyPage.shell.title")}
        actions={
          <Link href="/" style={homeButtonStyle}>
            {t("historyPage.homeButton")}
          </Link>
        }
      >
        <AnalysisStateCard
          title={t("historyPage.states.errorTitle")}
          description={t("historyPage.states.errorDescription")}
        />
      </AppShell>
    );
  }
}

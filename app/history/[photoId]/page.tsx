import Link from "next/link";
import type { CSSProperties } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { AnalysisResultViewer } from "@/features/upload/components/analysis-result-viewer";
import { createAnalysisMessages } from "@/features/upload/i18n/upload-page-messages";
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

type HistoryDetailPageProps = {
  params: Promise<{
    photoId: string;
  }>;
};

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { photoId } = await params;
  const parsedPhotoId = Number(photoId);

  if (!Number.isInteger(parsedPhotoId) || parsedPhotoId <= 0) {
    return (
      <AppShell
        title={t("historyDetailPage.shell.badge")}
        subtitle=""
        actions={
          <Link href="/" style={homeButtonStyle}>
            {t("historyDetailPage.homeButton")}
          </Link>
        }
      >
        <AnalysisStateCard
          title={t("historyDetailPage.states.notFoundTitle")}
          description={t("historyDetailPage.states.notFoundDescription")}
        />
      </AppShell>
    );
  }

  try {
    const historyService = createHistoryService();
    const detail = await historyService.getHistoryDetail(parsedPhotoId);
    const analysisMessages = createAnalysisMessages(t);

    if (!detail) {
      return (
        <AppShell
          title={t("historyDetailPage.shell.badge")}
          subtitle=""
          actions={
            <Link href="/" style={homeButtonStyle}>
              {t("historyDetailPage.homeButton")}
            </Link>
          }
        >
          <AnalysisStateCard
            title={t("historyDetailPage.states.notFoundTitle")}
            description={t("historyDetailPage.states.notFoundDescription")}
          />
        </AppShell>
      );
    }

    return (
      <AppShell
        title={t("historyDetailPage.shell.badge")}
        subtitle=""
        actions={
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <Link href="/" style={homeButtonStyle}>
              {t("historyDetailPage.homeButton")}
            </Link>
            <Link href="/history" style={homeButtonStyle}>
              {t("historyDetailPage.backButton")}
            </Link>
          </div>
        }
      >
        <div style={{ display: "grid", gap: "18px" }}>
          {detail.analysis ? (
            <AnalysisResultViewer
              uploaded={detail.photo}
              analysis={detail.analysis}
              initialContentSetPayload={detail.contentSet}
              initialCommerceContent={detail.commerceContent}
              messages={{
                ...analysisMessages,
                description: "",
              }}
            />
          ) : (
            <AnalysisStateCard
              title={t("historyDetailPage.states.noAnalysisTitle")}
              description={t("historyDetailPage.states.noAnalysisDescription")}
            />
          )}
        </div>
      </AppShell>
    );
  } catch {
    return (
      <AppShell
        title={t("historyDetailPage.shell.badge")}
        subtitle={t("historyDetailPage.shell.title")}
        actions={
          <Link href="/" style={homeButtonStyle}>
            {t("historyDetailPage.homeButton")}
          </Link>
        }
      >
        <AnalysisStateCard
          title={t("historyDetailPage.states.errorTitle")}
          description={t("historyDetailPage.states.errorDescription")}
        />
      </AppShell>
    );
  }
}

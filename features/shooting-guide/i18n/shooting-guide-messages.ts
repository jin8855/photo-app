import type { createTranslator } from "@/lib/i18n/translate";

type Translate = ReturnType<typeof createTranslator>;

export function createShootingGuideMessages(t: Translate) {
  return {
    title: t("shootingGuidePage.title"),
    description: t("shootingGuidePage.description"),
    categoryLabel: t("shootingGuidePage.categoryLabel"),
    subjectLabel: t("shootingGuidePage.subjectLabel"),
    distanceLabel: t("shootingGuidePage.distanceLabel"),
    deviceLabel: t("shootingGuidePage.deviceLabel"),
    resultTitle: t("shootingGuidePage.resultTitle"),
    resultDescription: t("shootingGuidePage.resultDescription"),
    empty: t("shootingGuidePage.empty"),
    backToUpload: t("shootingGuidePage.backToUpload"),
    detailButton: t("shootingGuidePage.detailButton"),
    collapseButton: t("shootingGuidePage.collapseButton"),
    detailLabel: t("shootingGuidePage.detailLabel"),
    whyLabel: t("shootingGuidePage.whyLabel"),
    whenLabel: t("shootingGuidePage.whenLabel"),
    exampleLabel: t("shootingGuidePage.exampleLabel"),
    settingLabel: t("shootingGuidePage.settingLabel"),
    copyDirectionLabel: t("shootingGuidePage.copyDirectionLabel"),
    focusLabel: t("shootingGuidePage.focusLabel"),
    lensLabel: t("shootingGuidePage.lensLabel"),
    phoneLabel: t("shootingGuidePage.phoneLabel"),
  };
}

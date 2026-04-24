import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { ShootingGuideScreen } from "@/features/shooting-guide/components/shooting-guide-screen";
import { createShootingGuideMessages } from "@/features/shooting-guide/i18n/shooting-guide-messages";
import { createTranslator } from "@/lib/i18n/translate";
import {
  getShootingGuide,
  listShootingGuideDeviceTypes,
  listShootingGuideDistances,
  listShootingGuideSubjects,
  listShootingGuideSituations,
} from "@/services/shooting-guide/shooting-guide-service";

const t = createTranslator("ko");

export default function ShootingGuidePage() {
  const situations = listShootingGuideSituations();
  const subjects = listShootingGuideSubjects();
  const distances = listShootingGuideDistances();
  const deviceTypes = listShootingGuideDeviceTypes();
  const initialSituation = situations[0]?.value ?? "rain";
  const initialSubject = subjects[0]?.value ?? "person";
  const initialDistance = distances[0]?.value ?? "medium";
  const initialDeviceType = deviceTypes[0]?.value ?? "galaxy_s25_ultra";

  return (
    <AppShell
      title={t("shootingGuidePage.shell.badge")}
      subtitle={t("shootingGuidePage.shell.title")}
      actions={
        <Link href="/" style={actionLinkStyle}>
          {t("shootingGuidePage.backToUpload")}
        </Link>
      }
    >
      <ShootingGuideScreen
        situations={situations}
        subjects={subjects}
        distances={distances}
        deviceTypes={deviceTypes}
        initialGuide={getShootingGuide({
          situation: initialSituation,
          subject: initialSubject,
          distance: initialDistance,
          deviceType: initialDeviceType,
        })}
        messages={createShootingGuideMessages(t)}
      />
    </AppShell>
  );
}

const actionLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "42px",
  borderRadius: "999px",
  border: "1px solid rgba(64, 47, 30, 0.12)",
  padding: "10px 14px",
  background: "rgba(255, 255, 255, 0.82)",
  color: "#1f1b17",
  fontSize: "13px",
  fontWeight: 800,
  textDecoration: "none",
};

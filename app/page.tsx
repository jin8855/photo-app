import { AppShell } from "@/components/layout/app-shell";
import { PhotoUploadScreen } from "@/features/upload/components/photo-upload-screen";
import { createPhotoUploadScreenMessages } from "@/features/upload/i18n/upload-page-messages";
import { createTranslator } from "@/lib/i18n/translate";

const t = createTranslator("ko");

export default function HomePage() {
  return (
    <AppShell title={t("uploadPage.shell.badge")} subtitle={t("uploadPage.shell.title")}>
      <PhotoUploadScreen messages={createPhotoUploadScreenMessages(t)} />
    </AppShell>
  );
}

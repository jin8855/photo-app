import { getSupabaseConfig } from "@/resources/config/database";

export function resolveStoredPhotoPreviewUrl(filePath: string): string {
  if (!filePath) {
    return filePath;
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  if (filePath.startsWith("/")) {
    return filePath;
  }

  try {
    const config = getSupabaseConfig();

    if (config.url && config.storageBucket) {
      const normalizedPath = filePath.replace(/^\/+/, "");
      return `${config.url}/storage/v1/object/public/${config.storageBucket}/${normalizedPath}`;
    }
  } catch {
    return filePath;
  }

  return filePath;
}

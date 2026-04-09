import type { PhotoStorage } from "@/services/storage/photo-storage";
import { createLocalPublicStorageAdapter } from "@/services/storage/adapters/local/local-public-storage-adapter";
import { createSupabaseStorageAdapter } from "@/services/storage/adapters/supabase/supabase-storage-adapter";
import { getAppRuntimeConfig } from "@/resources/config/app-runtime";

export function createPhotoStorage(): PhotoStorage {
  const runtime = getAppRuntimeConfig();

  switch (runtime.storageProvider) {
    case "local-public":
      return createLocalPublicStorageAdapter();
    case "supabase-storage":
      return createSupabaseStorageAdapter();
  }
}

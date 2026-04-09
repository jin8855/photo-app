import type { PhotoStorageAdapter } from "@/services/storage/adapters/photo-storage-adapter";
import { SupabasePhotoStorage } from "@/services/storage/adapters/supabase/supabase-photo-storage";

export function createSupabaseStorageAdapter(): PhotoStorageAdapter {
  return new SupabasePhotoStorage();
}

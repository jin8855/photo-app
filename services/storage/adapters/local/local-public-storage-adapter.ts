import type { PhotoStorageAdapter } from "@/services/storage/adapters/photo-storage-adapter";
import { LocalPublicPhotoStorage } from "@/services/storage/local-public-photo-storage";

export function createLocalPublicStorageAdapter(): PhotoStorageAdapter {
  return new LocalPublicPhotoStorage();
}

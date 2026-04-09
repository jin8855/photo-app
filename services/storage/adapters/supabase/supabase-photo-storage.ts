import type { PhotoStorage, StoredPhotoFile } from "@/services/storage/photo-storage";
import { randomUUID } from "node:crypto";

import { createSupabaseStorageClient } from "@/services/storage/adapters/supabase/supabase-storage-client";

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.normalize("NFKD");
  return normalized.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function buildObjectPath(fileName: string): string {
  const safeName = sanitizeFileName(fileName || "upload-image");
  return `uploads/${randomUUID()}-${safeName}`;
}

export class SupabasePhotoStorage implements PhotoStorage {
  async save(file: File): Promise<StoredPhotoFile> {
    const storage = createSupabaseStorageClient();
    const objectPath = buildObjectPath(file.name);
    const arrayBuffer = await file.arrayBuffer();
    const uploadPayload = Buffer.from(arrayBuffer);

    const { error } = await storage.client.storage.from(storage.bucket).upload(objectPath, uploadPayload, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) {
      throw new Error(`supabaseStorageUploadFailed:${error.message}`);
    }

    return {
      filePath: objectPath,
      previewUrl: storage.getPublicUrl(objectPath),
    };
  }

  async delete(filePath: string): Promise<void> {
    const storage = createSupabaseStorageClient();
    const normalizedPath = filePath.replace(/^\/+/, "");
    const { error } = await storage.client.storage.from(storage.bucket).remove([normalizedPath]);

    if (error) {
      throw new Error(`supabaseStorageDeleteFailed:${error.message}`);
    }
  }
}

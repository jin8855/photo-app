import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { PhotoStorage, StoredPhotoFile } from "@/services/storage/photo-storage";

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.normalize("NFKD");
  return normalized.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export class LocalPublicPhotoStorage implements PhotoStorage {
  async save(file: File): Promise<StoredPhotoFile> {
    const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDirectory, { recursive: true });

    const safeName = sanitizeFileName(file.name || "upload-image");
    const storedFileName = `${randomUUID()}-${safeName}`;
    const absoluteFilePath = path.join(uploadsDirectory, storedFileName);
    const publicFilePath = `/uploads/${storedFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(absoluteFilePath, Buffer.from(arrayBuffer));

    return {
      filePath: publicFilePath,
      previewUrl: publicFilePath,
    };
  }

  async delete(filePath: string): Promise<void> {
    const normalizedPath = filePath.replace(/^\/+/, "");
    const absoluteFilePath = path.join(process.cwd(), "public", normalizedPath);

    try {
      await fs.unlink(absoluteFilePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}

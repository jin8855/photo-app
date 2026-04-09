import type { UploadedPhotoRecord } from "@/lib/types/database";
import { AppError } from "@/lib/errors/app-error";
import { logServerWarn } from "@/lib/logging/app-logger";
import type { PhotoRepository } from "@/repositories/photo-repository";
import type { PhotoStorage } from "@/services/storage/photo-storage";

export class PhotoUploadService {
  constructor(
    private readonly photoRepository: PhotoRepository,
    private readonly photoStorage: PhotoStorage,
  ) {}

  async upload(file: File): Promise<UploadedPhotoRecord> {
    if (!file.type.startsWith("image/")) {
      throw new AppError({
        code: "invalidType",
        status: 400,
        message: "Only image uploads are supported.",
        details: {
          fileName: file.name,
          mimeType: file.type,
        },
      });
    }

    let storedFile;

    try {
      storedFile = await this.photoStorage.save(file);
    } catch (error) {
      throw new AppError({
        code: "uploadFailed",
        status: 500,
        message: "Failed to store the uploaded file.",
        details: {
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        },
        cause: error,
      });
    }

    try {
      const photo = await this.photoRepository.createPhoto({
        originalName: file.name,
        filePath: storedFile.filePath,
      });

      return {
        ...photo,
        previewUrl: storedFile.previewUrl,
      };
    } catch (error) {
      try {
        await this.photoStorage.delete(storedFile.filePath);
      } catch (cleanupError) {
        logServerWarn("photo.upload.rollbackFailed", {
          filePath: storedFile.filePath,
          cleanupError:
            cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }

      throw new AppError({
        code: "saveFailed",
        status: 500,
        message: "Failed to persist uploaded photo metadata.",
        details: {
          fileName: file.name,
          filePath: storedFile.filePath,
        },
        cause: error,
      });
    }
  }
}

import type { PhotoRepository } from "@/repositories/photo-repository";
import type { PhotoStorage } from "@/services/storage/photo-storage";

export class PhotoDeleteService {
  constructor(
    private readonly photoRepository: PhotoRepository,
    private readonly photoStorage: PhotoStorage,
  ) {}

  async delete(photoId: number): Promise<boolean> {
    const photo = await this.photoRepository.findById(photoId);

    if (!photo) {
      return false;
    }

    const deleted = await this.photoRepository.delete(photoId);

    if (!deleted) {
      return false;
    }

    await this.photoStorage.delete(photo.filePath);
    return true;
  }
}

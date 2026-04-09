import type { CreatePhotoInput, PhotoRecord } from "@/lib/types/database";
import type { PhotoRepository } from "@/repositories/photo-repository";

export class PhotoRecordService {
  constructor(private readonly photoRepository: PhotoRepository) {}

  async createPhoto(input: CreatePhotoInput): Promise<PhotoRecord> {
    return this.photoRepository.create(input);
  }

  async getPhoto(id: number): Promise<PhotoRecord | null> {
    return this.photoRepository.findById(id);
  }

  async listPhotos(): Promise<PhotoRecord[]> {
    return this.photoRepository.list();
  }
}

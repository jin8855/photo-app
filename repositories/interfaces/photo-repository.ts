import type { CreatePhotoInput, PhotoRecord } from "@/lib/types/database";

export interface PhotoRepository {
  createPhoto(input: CreatePhotoInput): Promise<PhotoRecord>;
  getPhoto(id: number): Promise<PhotoRecord | null>;
  getPhotoById(id: number): Promise<PhotoRecord | null>;
  listPhotos(): Promise<PhotoRecord[]>;
  create(input: CreatePhotoInput): Promise<PhotoRecord>;
  findById(id: number): Promise<PhotoRecord | null>;
  list(): Promise<PhotoRecord[]>;
  delete(id: number): Promise<boolean>;
}

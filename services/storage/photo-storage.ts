export type StoredPhotoFile = {
  filePath: string;
  previewUrl: string;
};

export interface PhotoStorage {
  save(file: File): Promise<StoredPhotoFile>;
  delete(filePath: string): Promise<void>;
}

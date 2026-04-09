import type { HistoryDetail, HistoryListItem } from "@/lib/types/history";

export interface HistoryRepository {
  list(): Promise<HistoryListItem[]>;
  findDetailByPhotoId(photoId: number): Promise<HistoryDetail | null>;
}

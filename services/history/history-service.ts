import type { HistoryDetail, HistoryListItem } from "@/lib/types/history";
import type { HistoryRepository } from "@/repositories/history-repository";

export class HistoryService {
  constructor(private readonly historyRepository: HistoryRepository) {}

  async listHistory(): Promise<HistoryListItem[]> {
    return this.historyRepository.list();
  }

  async getHistoryDetail(photoId: number): Promise<HistoryDetail | null> {
    return this.historyRepository.findDetailByPhotoId(photoId);
  }
}

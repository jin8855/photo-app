import { createHistoryRepository } from "@/repositories/repository-factory";
import { HistoryService } from "@/services/history/history-service";

export function createHistoryService(): HistoryService {
  return new HistoryService(createHistoryRepository());
}

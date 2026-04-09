import type { AnalysisRepository } from "@/repositories/analysis-repository";
import type { HistoryRepository } from "@/repositories/history-repository";
import type { PhotoRepository } from "@/repositories/photo-repository";

export type DatabaseRepositoryAdapter = {
  photoRepository: PhotoRepository;
  analysisRepository: AnalysisRepository;
  historyRepository: HistoryRepository;
};

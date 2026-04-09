import type { AnalysisRecord, CreateAnalysisInput } from "@/lib/types/database";
import type { AnalysisRepository } from "@/repositories/analysis-repository";
import type { PhotoRepository } from "@/repositories/photo-repository";

export class AnalysisRecordService {
  constructor(
    private readonly analysisRepository: AnalysisRepository,
    private readonly photoRepository: PhotoRepository,
  ) {}

  async createAnalysis(input: CreateAnalysisInput): Promise<AnalysisRecord> {
    const photo = await this.photoRepository.findById(input.photoId);

    if (!photo) {
      throw new Error("Photo not found for analysis.");
    }

    return this.analysisRepository.create(input);
  }

  async getAnalysis(id: number): Promise<AnalysisRecord | null> {
    return this.analysisRepository.findById(id);
  }

  async listAnalysesByPhoto(photoId: number): Promise<AnalysisRecord[]> {
    return this.analysisRepository.listByPhotoId(photoId);
  }
}

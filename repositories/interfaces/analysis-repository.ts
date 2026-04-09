import type { AnalysisRecord, CreateAnalysisInput } from "@/lib/types/database";

export interface AnalysisRepository {
  saveAnalysis(input: CreateAnalysisInput): Promise<AnalysisRecord>;
  saveGeneratedContentSet(analysisId: number, contentSetJson: string): Promise<AnalysisRecord | null>;
  saveGeneratedCommerceContent(
    analysisId: number,
    commerceContentJson: string,
  ): Promise<AnalysisRecord | null>;
  getAnalysis(id: number): Promise<AnalysisRecord | null>;
  getAnalysisByPhotoId(photoId: number): Promise<AnalysisRecord | null>;
  listAnalyses(photoId: number): Promise<AnalysisRecord[]>;
  create(input: CreateAnalysisInput): Promise<AnalysisRecord>;
  findById(id: number): Promise<AnalysisRecord | null>;
  listByPhotoId(photoId: number): Promise<AnalysisRecord[]>;
}

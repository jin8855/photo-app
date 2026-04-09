import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { GeneratedCommerceContent } from "@/lib/types/commerce";
import type { GeneratedContentSetPayload } from "@/lib/types/content";
import type { UploadedPhotoRecord } from "@/lib/types/database";

export type HistoryListItem = {
  photoId: number;
  originalName: string;
  filePath: string;
  photoCreatedAt: string;
  latestAnalysisId: number | null;
  sceneType: string | null;
  moodCategory: string | null;
  shortReview: string | null;
  analysisCreatedAt: string | null;
};

export type HistoryDetail = {
  photo: UploadedPhotoRecord;
  analysis: PhotoAnalysisResult | null;
  contentSet: GeneratedContentSetPayload | null;
  commerceContent: GeneratedCommerceContent | null;
};

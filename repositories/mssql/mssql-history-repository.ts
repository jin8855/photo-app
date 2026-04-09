import {
  normalizeScoredCaptions,
  normalizeScoredPhrases,
  type PhotoAnalysisResult,
} from "@/lib/types/analysis";
import type { GeneratedCommerceContent } from "@/lib/types/commerce";
import type { GeneratedContentSetPayload } from "@/lib/types/content";
import type { UploadedPhotoRecord } from "@/lib/types/database";
import type { HistoryDetail, HistoryListItem } from "@/lib/types/history";
import type { HistoryRepository } from "@/repositories/history-repository";
import type { MssqlQueryRunner } from "@/repositories/mssql/mssql-query-runner";
import { LocalMssqlQueryRunner } from "@/repositories/mssql/mssql-query-runner";
import {
  buildHistoryDetailByPhotoIdQuery,
  buildHistoryListQuery,
} from "@/repositories/mssql/queries/history-queries";

type HistoryListRow = {
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

type HistoryDetailRow = {
  photo: string;
  analysis: string | null;
};

type HistoryDetailPhoto = {
  id: number;
  originalName: string;
  filePath: string;
  createdAt: string;
};

type HistoryDetailAnalysis = {
  id: number;
  photoId: number;
  sceneType: string;
  moodCategory: string;
  shortReview: string;
  longReview: string;
  recommendedTextPosition: string;
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
  phrasesJson: string;
  captionsJson: string;
  hashtagsJson: string;
  generationSource: string;
  generationWarning: string | null;
  contentSetJson: string | null;
  commerceContentJson: string | null;
  createdAt: string;
};

function parseJson<T>(output: string): T | null {
  const trimmed = output.trim();
  if (!trimmed) {
    return null;
  }

  return JSON.parse(trimmed) as T;
}

function mapPhoto(photo: HistoryDetailPhoto): UploadedPhotoRecord {
  return {
    id: photo.id,
    originalName: photo.originalName,
    filePath: photo.filePath,
    createdAt: photo.createdAt,
    previewUrl: photo.filePath,
  };
}

function mapAnalysis(analysis: HistoryDetailAnalysis): PhotoAnalysisResult {
  return {
    id: analysis.id,
    photoId: analysis.photoId,
    scene_type: analysis.sceneType,
    mood_category: analysis.moodCategory,
    short_review: analysis.shortReview,
    long_review: analysis.longReview,
    recommended_text_position: analysis.recommendedTextPosition,
    wallpaper_score: analysis.wallpaperScore,
    social_score: analysis.socialScore,
    commercial_score: analysis.commercialScore,
    phrases: normalizeScoredPhrases(JSON.parse(analysis.phrasesJson)),
    captions: normalizeScoredCaptions(JSON.parse(analysis.captionsJson)),
    hashtags: JSON.parse(analysis.hashtagsJson) as string[],
    generation_source: analysis.generationSource === "openai" ? "openai" : "mock",
    generation_warning: analysis.generationWarning,
    created_at: analysis.createdAt,
  };
}

export class MssqlHistoryRepository implements HistoryRepository {
  constructor(private readonly queryRunner: MssqlQueryRunner = new LocalMssqlQueryRunner()) {}

  async list(): Promise<HistoryListItem[]> {
    const output = this.queryRunner.run(buildHistoryListQuery());

    return parseJson<HistoryListRow[]>(output) ?? [];
  }

  async findDetailByPhotoId(photoId: number): Promise<HistoryDetail | null> {
    const output = this.queryRunner.run(buildHistoryDetailByPhotoIdQuery(photoId));

    const parsed = parseJson<HistoryDetailRow>(output);
    if (!parsed) {
      return null;
    }

    const parsedPhoto = JSON.parse(parsed.photo) as HistoryDetailPhoto;
    const parsedAnalysis = parsed.analysis
      ? (JSON.parse(parsed.analysis) as HistoryDetailAnalysis)
      : null;

    return {
      photo: mapPhoto(parsedPhoto),
      analysis: parsedAnalysis ? mapAnalysis(parsedAnalysis) : null,
      contentSet:
        parsedAnalysis?.contentSetJson
          ? (JSON.parse(parsedAnalysis.contentSetJson) as GeneratedContentSetPayload)
          : null,
      commerceContent:
        parsedAnalysis?.commerceContentJson
          ? (JSON.parse(parsedAnalysis.commerceContentJson) as GeneratedCommerceContent)
          : null,
    };
  }
}

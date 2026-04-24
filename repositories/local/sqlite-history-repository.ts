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
import { mapAnalysisRow, mapPhotoRow } from "@/repositories/local/sqlite-mappers";
import { resolveStoredPhotoPreviewUrl } from "@/services/storage/photo-preview-url";
import type Database from "better-sqlite3";

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

type PhotoRow = {
  id: number;
  original_name: string;
  file_path: string;
  created_at: string;
};

type AnalysisRow = {
  id: number;
  photo_id: number;
  scene_type: string;
  mood_category: string;
  photo_style_type: string;
  short_review: string;
  long_review: string;
  recommended_text_position: string;
  wallpaper_score: number;
  social_score: number;
  commercial_score: number;
  phrases_json: string;
  captions_json: string;
  hashtags_json: string;
  generation_source: string;
  generation_warning: string | null;
  content_set_json: string | null;
  commerce_content_json: string | null;
  created_at: string;
};

function mapHistoryPhoto(row: PhotoRow): UploadedPhotoRecord {
  const photo = mapPhotoRow(row);

  return {
    ...photo,
    previewUrl: resolveStoredPhotoPreviewUrl(photo.filePath),
  };
}

function mapHistoryAnalysis(row: AnalysisRow): PhotoAnalysisResult {
  const analysis = mapAnalysisRow(row);

  return {
    id: analysis.id,
    photoId: analysis.photoId,
    scene_type: analysis.sceneType,
    mood_category: analysis.moodCategory,
    photo_style_type: analysis.photoStyleType as PhotoAnalysisResult["photo_style_type"],
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

export class SqliteHistoryRepository implements HistoryRepository {
  constructor(private readonly database: Database.Database) {}

  async list(): Promise<HistoryListItem[]> {
    const statement = this.database.prepare(
      `
        WITH ranked_analyses AS (
          SELECT
            a.id,
            a.photo_id,
            a.scene_type,
            a.mood_category,
            a.photo_style_type,
            a.short_review,
            a.created_at AS analysisCreatedAt,
            ROW_NUMBER() OVER (PARTITION BY a.photo_id ORDER BY a.created_at DESC, a.id DESC) AS rn
          FROM analyses a
        )
        SELECT
          p.id AS photoId,
          p.original_name AS originalName,
          p.file_path AS filePath,
          p.created_at AS photoCreatedAt,
          ra.id AS latestAnalysisId,
          ra.scene_type AS sceneType,
          ra.mood_category AS moodCategory,
          ra.short_review AS shortReview,
          ra.analysisCreatedAt
        FROM photos p
        LEFT JOIN ranked_analyses ra
          ON p.id = ra.photo_id
         AND ra.rn = 1
        ORDER BY p.created_at DESC, p.id DESC
      `,
    );

    return (statement.all() as HistoryListRow[]).map((item) => ({
      ...item,
      previewUrl: resolveStoredPhotoPreviewUrl(item.filePath),
    }));
  }

  async findDetailByPhotoId(photoId: number): Promise<HistoryDetail | null> {
    const photoStatement = this.database.prepare(
      `
        SELECT id, original_name, file_path, created_at
        FROM photos
        WHERE id = ?
      `,
    );
    const analysisStatement = this.database.prepare(
      `
        SELECT
          id,
          photo_id,
          scene_type,
          mood_category,
          photo_style_type,
          short_review,
          long_review,
          recommended_text_position,
          wallpaper_score,
          social_score,
          commercial_score,
          phrases_json,
          captions_json,
          hashtags_json,
          generation_source,
          generation_warning,
          content_set_json,
          commerce_content_json,
          created_at
        FROM analyses
        WHERE photo_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
    );

    const photo = photoStatement.get(photoId) as PhotoRow | undefined;
    if (!photo) {
      return null;
    }

    const analysis = analysisStatement.get(photoId) as AnalysisRow | undefined;

    return {
      photo: mapHistoryPhoto(photo),
      analysis: analysis ? mapHistoryAnalysis(analysis) : null,
      contentSet: analysis?.content_set_json
        ? (JSON.parse(analysis.content_set_json) as GeneratedContentSetPayload)
        : null,
      commerceContent: analysis?.commerce_content_json
        ? (JSON.parse(analysis.commerce_content_json) as GeneratedCommerceContent)
        : null,
    };
  }
}

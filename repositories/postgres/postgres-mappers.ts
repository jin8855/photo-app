import type { AnalysisRecord, PhotoRecord } from "@/lib/types/database";

type PostgresPhotoRow = {
  id: number | string;
  original_name: string;
  file_path: string;
  created_at: string | Date;
};

type PostgresAnalysisRow = {
  id: number | string;
  photo_id: number | string;
  scene_type: string;
  mood_category: string;
  photo_style_type: string;
  short_review: string;
  long_review: string;
  recommended_text_position: string;
  wallpaper_score: number;
  social_score: number;
  commercial_score: number;
  phrases_json: unknown;
  captions_json: unknown;
  hashtags_json: unknown;
  generation_source: string;
  generation_warning: string | null;
  content_set_json?: unknown;
  commerce_content_json?: unknown;
  created_at: string | Date;
};

function stringifyJsonValue(value: unknown, fallback: unknown): string {
  return JSON.stringify(value ?? fallback);
}

function toTimestampString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapPostgresPhotoRow(row: PostgresPhotoRow): PhotoRecord {
  return {
    id: Number(row.id),
    originalName: row.original_name,
    filePath: row.file_path,
    createdAt: toTimestampString(row.created_at),
  };
}

export function mapPostgresAnalysisRow(row: PostgresAnalysisRow): AnalysisRecord {
  return {
    id: Number(row.id),
    photoId: Number(row.photo_id),
    sceneType: row.scene_type,
    moodCategory: row.mood_category,
    photoStyleType: row.photo_style_type,
    shortReview: row.short_review,
    longReview: row.long_review,
    recommendedTextPosition: row.recommended_text_position,
    wallpaperScore: row.wallpaper_score,
    socialScore: row.social_score,
    commercialScore: row.commercial_score,
    phrasesJson: stringifyJsonValue(row.phrases_json, []),
    captionsJson: stringifyJsonValue(row.captions_json, []),
    hashtagsJson: stringifyJsonValue(row.hashtags_json, []),
    generationSource: row.generation_source,
    generationWarning: row.generation_warning,
    contentSetJson:
      row.content_set_json === undefined || row.content_set_json === null
        ? null
        : JSON.stringify(row.content_set_json),
    commerceContentJson:
      row.commerce_content_json === undefined || row.commerce_content_json === null
        ? null
        : JSON.stringify(row.commerce_content_json),
    createdAt: toTimestampString(row.created_at),
  };
}

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
import {
  mapPostgresAnalysisRow,
  mapPostgresPhotoRow,
} from "@/repositories/postgres/postgres-mappers";
import { createPostgresQueryClient } from "@/repositories/postgres/postgres-query-client";
import { assertPostgresConfigured } from "@/repositories/postgres/postgres-repository-errors";

type HistoryListRow = {
  photo_id: number | string;
  original_name: string;
  file_path: string;
  photo_created_at: string | Date;
  latest_analysis_id: number | string | null;
  scene_type: string | null;
  mood_category: string | null;
  short_review: string | null;
  analysis_created_at: string | Date | null;
};

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
  content_set_json: unknown;
  commerce_content_json: unknown;
  created_at: string | Date;
};

function toTimestampString(value: string | Date | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function mapHistoryPhoto(row: PostgresPhotoRow): UploadedPhotoRecord {
  const photo = mapPostgresPhotoRow(row);

  return {
    ...photo,
    previewUrl: photo.filePath,
  };
}

function mapHistoryAnalysis(row: PostgresAnalysisRow): PhotoAnalysisResult {
  const analysis = mapPostgresAnalysisRow(row);

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

export class PostgresHistoryRepository implements HistoryRepository {
  private readonly client = createPostgresQueryClient();

  constructor() {
    assertPostgresConfigured();
  }

  async list(): Promise<HistoryListItem[]> {
    const rows = await this.client.query<HistoryListRow>(
      `
        select
          p.id as photo_id,
          p.original_name,
          p.file_path,
          p.created_at as photo_created_at,
          a.id as latest_analysis_id,
          a.scene_type,
          a.mood_category,
          a.short_review,
          a.created_at as analysis_created_at
        from public.photos p
        left join lateral (
          select
            id,
            scene_type,
            mood_category,
            short_review,
            created_at
          from public.analyses
          where photo_id = p.id
          order by created_at desc, id desc
          limit 1
        ) a on true
        order by p.created_at desc, p.id desc
      `,
    );

    return rows.map((row) => ({
      photoId: Number(row.photo_id),
      originalName: row.original_name,
      filePath: row.file_path,
      photoCreatedAt: toTimestampString(row.photo_created_at) ?? "",
      latestAnalysisId:
        row.latest_analysis_id === null ? null : Number(row.latest_analysis_id),
      sceneType: row.scene_type,
      moodCategory: row.mood_category,
      shortReview: row.short_review,
      analysisCreatedAt: toTimestampString(row.analysis_created_at),
    }));
  }

  async findDetailByPhotoId(photoId: number): Promise<HistoryDetail | null> {
    const photoRows = await this.client.query<PostgresPhotoRow>(
      `
        select id, original_name, file_path, created_at
        from public.photos
        where id = $1
      `,
      [photoId],
    );
    const photo = photoRows[0];

    if (!photo) {
      return null;
    }

    const analysisRows = await this.client.query<PostgresAnalysisRow>(
      `
        select
          id,
          photo_id,
          scene_type,
          mood_category,
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
        from public.analyses
        where photo_id = $1
        order by created_at desc, id desc
        limit 1
      `,
      [photoId],
    );
    const analysis = analysisRows[0];
    const mappedAnalysis = analysis ? mapPostgresAnalysisRow(analysis) : null;

    return {
      photo: mapHistoryPhoto(photo),
      analysis: analysis ? mapHistoryAnalysis(analysis) : null,
      contentSet: mappedAnalysis?.contentSetJson
        ? (JSON.parse(mappedAnalysis.contentSetJson) as GeneratedContentSetPayload)
        : null,
      commerceContent: mappedAnalysis?.commerceContentJson
        ? (JSON.parse(mappedAnalysis.commerceContentJson) as GeneratedCommerceContent)
        : null,
    };
  }
}

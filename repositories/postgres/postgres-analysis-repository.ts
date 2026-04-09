import type { AnalysisRecord, CreateAnalysisInput } from "@/lib/types/database";
import type { AnalysisRepository } from "@/repositories/analysis-repository";
import { mapPostgresAnalysisRow } from "@/repositories/postgres/postgres-mappers";
import { createPostgresQueryClient } from "@/repositories/postgres/postgres-query-client";
import { assertPostgresConfigured } from "@/repositories/postgres/postgres-repository-errors";

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

function parseJsonPayload(value: string): unknown {
  return JSON.parse(value);
}

export class PostgresAnalysisRepository implements AnalysisRepository {
  private readonly client = createPostgresQueryClient();

  constructor() {
    assertPostgresConfigured();
  }

  async saveAnalysis(input: CreateAnalysisInput): Promise<AnalysisRecord> {
    const rows = await this.client.query<PostgresAnalysisRow>(
      `
        insert into public.analyses (
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
          generation_warning
        )
        values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10::jsonb, $11::jsonb, $12::jsonb, $13, $14
        )
        returning
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
      `,
      [
        input.photoId,
        input.sceneType,
        input.moodCategory,
        input.shortReview,
        input.longReview,
        input.recommendedTextPosition,
        input.wallpaperScore,
        input.socialScore,
        input.commercialScore,
        parseJsonPayload(input.phrasesJson),
        parseJsonPayload(input.captionsJson),
        parseJsonPayload(input.hashtagsJson),
        input.generationSource,
        input.generationWarning,
      ],
    );
    const created = rows[0];

    if (!created) {
      throw new Error("Failed to create analysis record.");
    }

    return mapPostgresAnalysisRow(created);
  }

  async saveGeneratedContentSet(
    analysisId: number,
    contentSetJson: string,
  ): Promise<AnalysisRecord | null> {
    const rows = await this.client.query<PostgresAnalysisRow>(
      `
        update public.analyses
        set content_set_json = $2::jsonb
        where id = $1
        returning
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
      `,
      [analysisId, parseJsonPayload(contentSetJson)],
    );

    return rows[0] ? mapPostgresAnalysisRow(rows[0]) : null;
  }

  async saveGeneratedCommerceContent(
    analysisId: number,
    commerceContentJson: string,
  ): Promise<AnalysisRecord | null> {
    const rows = await this.client.query<PostgresAnalysisRow>(
      `
        update public.analyses
        set commerce_content_json = $2::jsonb
        where id = $1
        returning
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
      `,
      [analysisId, parseJsonPayload(commerceContentJson)],
    );

    return rows[0] ? mapPostgresAnalysisRow(rows[0]) : null;
  }

  async getAnalysis(id: number): Promise<AnalysisRecord | null> {
    const rows = await this.client.query<PostgresAnalysisRow>(
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
        where id = $1
      `,
      [id],
    );

    return rows[0] ? mapPostgresAnalysisRow(rows[0]) : null;
  }

  async getAnalysisByPhotoId(photoId: number): Promise<AnalysisRecord | null> {
    return (await this.listByPhotoId(photoId))[0] ?? null;
  }

  async listAnalyses(photoId: number): Promise<AnalysisRecord[]> {
    return this.listByPhotoId(photoId);
  }

  async create(input: CreateAnalysisInput): Promise<AnalysisRecord> {
    return this.saveAnalysis(input);
  }

  async findById(id: number): Promise<AnalysisRecord | null> {
    return this.getAnalysis(id);
  }

  async listByPhotoId(photoId: number): Promise<AnalysisRecord[]> {
    const rows = await this.client.query<PostgresAnalysisRow>(
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
      `,
      [photoId],
    );

    return rows.map(mapPostgresAnalysisRow);
  }
}

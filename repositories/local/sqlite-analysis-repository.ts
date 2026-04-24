import type Database from "better-sqlite3";

import type { AnalysisRecord, CreateAnalysisInput } from "@/lib/types/database";
import type { AnalysisRepository } from "@/repositories/analysis-repository";
import { mapAnalysisRow } from "@/repositories/local/sqlite-mappers";

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

export class SqliteAnalysisRepository implements AnalysisRepository {
  constructor(private readonly database: Database.Database) {}

  async saveAnalysis(input: CreateAnalysisInput): Promise<AnalysisRecord> {
    const statement = this.database.prepare(
      `
        INSERT INTO analyses (
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
          commerce_content_json
        )
        VALUES (
          @photoId,
          @sceneType,
          @moodCategory,
          @photoStyleType,
          @shortReview,
          @longReview,
          @recommendedTextPosition,
          @wallpaperScore,
          @socialScore,
          @commercialScore,
          @phrasesJson,
          @captionsJson,
          @hashtagsJson,
          @generationSource,
          @generationWarning,
          NULL,
          NULL
        )
      `,
    );

    const result = statement.run(input);
    const created = await this.findById(Number(result.lastInsertRowid));

    if (!created) {
      throw new Error("Failed to create analysis record.");
    }

    return created;
  }

  async getAnalysis(id: number): Promise<AnalysisRecord | null> {
    const statement = this.database.prepare(
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
          created_at
        FROM analyses
        WHERE id = ?
      `,
    );

    const row = statement.get(id) as AnalysisRow | undefined;
    return row ? mapAnalysisRow(row) : null;
  }

  async getAnalysisByPhotoId(photoId: number): Promise<AnalysisRecord | null> {
    return (await this.listByPhotoId(photoId))[0] ?? null;
  }

  async saveGeneratedContentSet(
    analysisId: number,
    contentSetJson: string,
  ): Promise<AnalysisRecord | null> {
    const statement = this.database.prepare(
      `
        UPDATE analyses
        SET content_set_json = ?
        WHERE id = ?
      `,
    );

    statement.run(contentSetJson, analysisId);
    return this.findById(analysisId);
  }

  async saveGeneratedCommerceContent(
    analysisId: number,
    commerceContentJson: string,
  ): Promise<AnalysisRecord | null> {
    const statement = this.database.prepare(
      `
        UPDATE analyses
        SET commerce_content_json = ?
        WHERE id = ?
      `,
    );

    statement.run(commerceContentJson, analysisId);
    return this.findById(analysisId);
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
    const statement = this.database.prepare(
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
          created_at
        FROM analyses
        WHERE photo_id = ?
        ORDER BY created_at DESC, id DESC
      `,
    );

    const rows = statement.all(photoId) as AnalysisRow[];
    return rows.map(mapAnalysisRow);
  }
}

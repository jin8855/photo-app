import { toSqlNvarcharLiteral } from "@/lib/db/sql-literal";
import type { CreateAnalysisInput } from "@/lib/types/database";

export function buildInsertAnalysisQuery(input: CreateAnalysisInput): string {
  return `
    SET NOCOUNT ON;
    DECLARE @Inserted TABLE (
      id INT,
      photoId INT,
      sceneType NVARCHAR(100),
      moodCategory NVARCHAR(100),
      shortReview NVARCHAR(500),
      longReview NVARCHAR(MAX),
      recommendedTextPosition NVARCHAR(100),
      wallpaperScore INT,
      socialScore INT,
      commercialScore INT,
      phrasesJson NVARCHAR(MAX),
      captionsJson NVARCHAR(MAX),
      hashtagsJson NVARCHAR(MAX),
      generationSource NVARCHAR(50),
      generationWarning NVARCHAR(500),
      contentSetJson NVARCHAR(MAX),
      commerceContentJson NVARCHAR(MAX),
      createdAt NVARCHAR(50)
    );

    INSERT INTO dbo.analyses (
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
    OUTPUT
      inserted.id,
      inserted.photo_id,
      inserted.scene_type,
      inserted.mood_category,
      inserted.short_review,
      inserted.long_review,
      inserted.recommended_text_position,
      inserted.wallpaper_score,
      inserted.social_score,
      inserted.commercial_score,
      inserted.phrases_json,
      inserted.captions_json,
      inserted.hashtags_json,
      inserted.generation_source,
      inserted.generation_warning,
      inserted.content_set_json,
      inserted.commerce_content_json,
      CONVERT(NVARCHAR(50), inserted.created_at, 126)
    INTO @Inserted
    VALUES (
      ${input.photoId},
      ${toSqlNvarcharLiteral(input.sceneType)},
      ${toSqlNvarcharLiteral(input.moodCategory)},
      ${toSqlNvarcharLiteral(input.shortReview)},
      ${toSqlNvarcharLiteral(input.longReview)},
      ${toSqlNvarcharLiteral(input.recommendedTextPosition)},
      ${input.wallpaperScore},
      ${input.socialScore},
      ${input.commercialScore},
      ${toSqlNvarcharLiteral(input.phrasesJson)},
      ${toSqlNvarcharLiteral(input.captionsJson)},
      ${toSqlNvarcharLiteral(input.hashtagsJson)},
      ${toSqlNvarcharLiteral(input.generationSource)},
      ${input.generationWarning ? toSqlNvarcharLiteral(input.generationWarning) : "NULL"}
    );

    SELECT * FROM @Inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
  `;
}

export function buildFindAnalysisByIdQuery(id: number): string {
  return `
    SET NOCOUNT ON;
    SELECT
      id,
      photo_id AS photoId,
      scene_type AS sceneType,
      mood_category AS moodCategory,
      short_review AS shortReview,
      long_review AS longReview,
      recommended_text_position AS recommendedTextPosition,
      wallpaper_score AS wallpaperScore,
      social_score AS socialScore,
      commercial_score AS commercialScore,
      phrases_json AS phrasesJson,
      captions_json AS captionsJson,
      hashtags_json AS hashtagsJson,
      generation_source AS generationSource,
      generation_warning AS generationWarning,
      content_set_json AS contentSetJson,
      commerce_content_json AS commerceContentJson,
      CONVERT(NVARCHAR(50), created_at, 126) AS createdAt
    FROM dbo.analyses
    WHERE id = ${id}
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
  `;
}

export function buildListAnalysesByPhotoIdQuery(photoId: number): string {
  return `
    SET NOCOUNT ON;
    SELECT
      id,
      photo_id AS photoId,
      scene_type AS sceneType,
      mood_category AS moodCategory,
      short_review AS shortReview,
      long_review AS longReview,
      recommended_text_position AS recommendedTextPosition,
      wallpaper_score AS wallpaperScore,
      social_score AS socialScore,
      commercial_score AS commercialScore,
      phrases_json AS phrasesJson,
      captions_json AS captionsJson,
      hashtags_json AS hashtagsJson,
      generation_source AS generationSource,
      generation_warning AS generationWarning,
      content_set_json AS contentSetJson,
      commerce_content_json AS commerceContentJson,
      CONVERT(NVARCHAR(50), created_at, 126) AS createdAt
    FROM dbo.analyses
    WHERE photo_id = ${photoId}
    ORDER BY created_at DESC, id DESC
    FOR JSON PATH;
  `;
}

export function buildUpdateGeneratedContentSetQuery(analysisId: number, contentSetJson: string): string {
  return `
    SET NOCOUNT ON;
    UPDATE dbo.analyses
    SET content_set_json = ${toSqlNvarcharLiteral(contentSetJson)}
    WHERE id = ${analysisId};

    ${buildFindAnalysisByIdQuery(analysisId)}
  `;
}

export function buildUpdateGeneratedCommerceContentQuery(
  analysisId: number,
  commerceContentJson: string,
): string {
  return `
    SET NOCOUNT ON;
    UPDATE dbo.analyses
    SET commerce_content_json = ${toSqlNvarcharLiteral(commerceContentJson)}
    WHERE id = ${analysisId};

    ${buildFindAnalysisByIdQuery(analysisId)}
  `;
}

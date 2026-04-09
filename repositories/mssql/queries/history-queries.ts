export function buildHistoryListQuery(): string {
  return `
    SET NOCOUNT ON;
    WITH ranked_analyses AS (
      SELECT
        a.id,
        a.photo_id,
        a.scene_type,
        a.mood_category,
        a.short_review,
        CONVERT(NVARCHAR(50), a.created_at, 126) AS analysisCreatedAt,
        ROW_NUMBER() OVER (PARTITION BY a.photo_id ORDER BY a.created_at DESC, a.id DESC) AS rn
      FROM dbo.analyses a
    )
    SELECT
      p.id AS photoId,
      p.original_name AS originalName,
      p.file_path AS filePath,
      CONVERT(NVARCHAR(50), p.created_at, 126) AS photoCreatedAt,
      ra.id AS latestAnalysisId,
      ra.scene_type AS sceneType,
      ra.mood_category AS moodCategory,
      ra.short_review AS shortReview,
      ra.analysisCreatedAt
    FROM dbo.photos p
    LEFT JOIN ranked_analyses ra
      ON p.id = ra.photo_id
     AND ra.rn = 1
    ORDER BY p.created_at DESC, p.id DESC
    FOR JSON PATH;
  `;
}

export function buildHistoryDetailByPhotoIdQuery(photoId: number): string {
  return `
    SET NOCOUNT ON;
    SELECT
      (
        SELECT
          p.id,
          p.original_name AS originalName,
          p.file_path AS filePath,
          CONVERT(NVARCHAR(50), p.created_at, 126) AS createdAt
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
      ) AS photo,
      (
        SELECT TOP 1
          a.id,
          a.photo_id AS photoId,
          a.scene_type AS sceneType,
          a.mood_category AS moodCategory,
          a.short_review AS shortReview,
          a.long_review AS longReview,
          a.recommended_text_position AS recommendedTextPosition,
          a.wallpaper_score AS wallpaperScore,
          a.social_score AS socialScore,
          a.commercial_score AS commercialScore,
          a.phrases_json AS phrasesJson,
          a.captions_json AS captionsJson,
          a.hashtags_json AS hashtagsJson,
          a.generation_source AS generationSource,
          a.generation_warning AS generationWarning,
          a.content_set_json AS contentSetJson,
          a.commerce_content_json AS commerceContentJson,
          CONVERT(NVARCHAR(50), a.created_at, 126) AS createdAt
        FROM dbo.analyses a
        WHERE a.photo_id = p.id
        ORDER BY a.created_at DESC, a.id DESC
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
      ) AS analysis
    FROM dbo.photos p
    WHERE p.id = ${photoId}
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
  `;
}

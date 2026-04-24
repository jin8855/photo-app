import type { AnalysisRecord, PhotoRecord } from "@/lib/types/database";

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

export function mapPhotoRow(row: PhotoRow): PhotoRecord {
  return {
    id: row.id,
    originalName: row.original_name,
    filePath: row.file_path,
    createdAt: row.created_at,
  };
}

export function mapAnalysisRow(row: AnalysisRow): AnalysisRecord {
  return {
    id: row.id,
    photoId: row.photo_id,
    sceneType: row.scene_type,
    moodCategory: row.mood_category,
    photoStyleType: row.photo_style_type,
    shortReview: row.short_review,
    longReview: row.long_review,
    recommendedTextPosition: row.recommended_text_position,
    wallpaperScore: row.wallpaper_score,
    socialScore: row.social_score,
    commercialScore: row.commercial_score,
    phrasesJson: row.phrases_json,
    captionsJson: row.captions_json,
    hashtagsJson: row.hashtags_json,
    generationSource: row.generation_source,
    generationWarning: row.generation_warning,
    contentSetJson: row.content_set_json,
    commerceContentJson: row.commerce_content_json,
    createdAt: row.created_at,
  };
}

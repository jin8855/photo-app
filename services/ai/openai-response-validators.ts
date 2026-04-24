import type { PhotoStyleType } from "@/lib/types/analysis";

type OpenAiTextPayload = {
  phrases: string[];
  captions: string[];
};

export type OpenAiImageAnalysisPayload = {
  scene_type: string;
  mood_category: string;
  photo_style_type: PhotoStyleType;
  short_review: string;
  long_review: string;
  recommended_text_position: string;
  wallpaper_score: number;
  social_score: number;
  commercial_score: number;
  hashtags: string[];
};

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isPhotoStyleType(value: unknown): value is PhotoStyleType {
  return (
    value === "emotional_landscape" ||
    value === "spring_healing" ||
    value === "lonely_night" ||
    value === "reflective_fog" ||
    value === "travel_korean" ||
    value === "natural_healing" ||
    value === "action_speed" ||
    value === "sports_energy" ||
    value === "urban_mood" ||
    value === "other"
  );
}

export function validateOpenAiTextPayload(value: unknown): OpenAiTextPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Partial<OpenAiTextPayload>;

  if (!isNonEmptyStringArray(payload.phrases) || !isNonEmptyStringArray(payload.captions)) {
    return null;
  }

  if (payload.phrases.length !== 10 || payload.captions.length !== 5) {
    return null;
  }

  return {
    phrases: payload.phrases.map((item) => item.trim()),
    captions: payload.captions.map((item) => item.trim()),
  };
}

export function validateOpenAiImageAnalysisPayload(
  value: unknown,
): OpenAiImageAnalysisPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Partial<OpenAiImageAnalysisPayload>;

  if (
    typeof payload.scene_type !== "string" ||
    !payload.scene_type.trim() ||
    typeof payload.mood_category !== "string" ||
    !payload.mood_category.trim() ||
    !isPhotoStyleType(payload.photo_style_type) ||
    typeof payload.short_review !== "string" ||
    !payload.short_review.trim() ||
    typeof payload.long_review !== "string" ||
    !payload.long_review.trim() ||
    typeof payload.recommended_text_position !== "string" ||
    !payload.recommended_text_position.trim() ||
    !isScore(payload.wallpaper_score) ||
    !isScore(payload.social_score) ||
    !isScore(payload.commercial_score) ||
    !isNonEmptyStringArray(payload.hashtags)
  ) {
    return null;
  }

  return {
    scene_type: payload.scene_type.trim(),
    mood_category: payload.mood_category.trim(),
    photo_style_type: payload.photo_style_type,
    short_review: payload.short_review.trim(),
    long_review: payload.long_review.trim(),
    recommended_text_position: payload.recommended_text_position.trim(),
    wallpaper_score: payload.wallpaper_score,
    social_score: payload.social_score,
    commercial_score: payload.commercial_score,
    hashtags: payload.hashtags.map((item) => item.trim()).filter(Boolean).slice(0, 10),
  };
}

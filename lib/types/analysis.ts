export type ScoredPhrase = {
  phrase: string;
  score: number;
  reason: string;
};

export type ScoredCaption = {
  caption: string;
  score: number;
  reason: string;
};

export type AnalysisGenerationSource = "mock" | "openai";

export type PhotoStyleType =
  | "emotional_landscape"
  | "spring_healing"
  | "lonely_night"
  | "reflective_fog"
  | "travel_korean"
  | "natural_healing"
  | "action_speed"
  | "sports_energy"
  | "urban_mood"
  | "other";

export type PhotoAnalysisResult = {
  id: number;
  photoId: number;
  scene_type: string;
  mood_category: string;
  photo_style_type: PhotoStyleType;
  short_review: string;
  long_review: string;
  recommended_text_position: string;
  wallpaper_score: number;
  social_score: number;
  commercial_score: number;
  phrases: ScoredPhrase[];
  captions: ScoredCaption[];
  hashtags: string[];
  generation_source: AnalysisGenerationSource;
  generation_warning: string | null;
  created_at: string;
};

export type AnalysisGenerationInput = {
  photoId: number;
  originalName: string;
  filePath: string;
};

export interface PhotoAnalysisProvider {
  analyze(input: AnalysisGenerationInput): Promise<Omit<PhotoAnalysisResult, "id" | "created_at">>;
}

export function normalizeScoredPhrases(value: unknown): ScoredPhrase[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return {
          phrase: item,
          score: 70,
          reason: "",
        } satisfies ScoredPhrase;
      }

      if (
        typeof item === "object" &&
        item !== null &&
        "phrase" in item &&
        typeof item.phrase === "string"
      ) {
        const score = typeof item.score === "number" ? item.score : 70;
        const reason = typeof item.reason === "string" ? item.reason : "";

        return {
          phrase: item.phrase,
          score,
          reason,
        } satisfies ScoredPhrase;
      }

      return null;
    })
    .filter((item): item is ScoredPhrase => item !== null);
}

export function normalizeScoredCaptions(value: unknown): ScoredCaption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return {
          caption: item,
          score: 70,
          reason: "",
        } satisfies ScoredCaption;
      }

      if (
        typeof item === "object" &&
        item !== null &&
        "caption" in item &&
        typeof item.caption === "string"
      ) {
        const score = typeof item.score === "number" ? item.score : 70;
        const reason = typeof item.reason === "string" ? item.reason : "";

        return {
          caption: item.caption,
          score,
          reason,
        } satisfies ScoredCaption;
      }

      return null;
    })
    .filter((item): item is ScoredCaption => item !== null);
}

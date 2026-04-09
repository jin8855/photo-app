import type { AnalysisGenerationInput, PhotoAnalysisProvider, PhotoAnalysisResult } from "@/lib/types/analysis";
import {
  buildCaptions,
  buildPhraseCandidates,
  buildScoredCaptions,
  buildScoredPhrases,
  getPresetMatchSource,
  getMockMessages,
  hashInput,
  normalizeSeedSource,
  resolvePreset,
} from "@/services/analyses/providers/analysis-preset";

export class MockPhotoAnalysisProvider implements PhotoAnalysisProvider {
  async analyze(
    input: AnalysisGenerationInput,
  ): Promise<Omit<PhotoAnalysisResult, "id" | "created_at">> {
    const messages = getMockMessages();
    const seed = hashInput(normalizeSeedSource(input.originalName));
    const preset = resolvePreset(messages, input.originalName, seed);
    const presetMatchSource = getPresetMatchSource(messages, input.originalName);

    return {
      photoId: input.photoId,
      scene_type: preset.scene_type,
      mood_category: preset.mood_category,
      short_review: preset.short_review,
      long_review: preset.long_review,
      recommended_text_position: preset.recommended_text_position,
      wallpaper_score: preset.wallpaper_score,
      social_score: preset.social_score,
      commercial_score: preset.commercial_score,
      phrases: buildScoredPhrases(buildPhraseCandidates(preset, seed), messages.scoring),
      captions: buildScoredCaptions(buildCaptions(preset, seed), messages.scoring),
      hashtags: preset.hashtags,
      generation_source: "mock",
      generation_warning: presetMatchSource === "fallback" ? "heuristicPreset" : null,
    };
  }
}

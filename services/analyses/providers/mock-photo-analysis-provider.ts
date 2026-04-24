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
  resolveAnalysisMetadata,
  resolvePhotoStyleType,
  resolvePreset,
  resolvePresetForPhotoStyle,
} from "@/services/analyses/providers/analysis-preset";
import { resolveMockVisualPhotoStyleType } from "@/services/analyses/providers/mock-visual-style-resolver";

export class MockPhotoAnalysisProvider implements PhotoAnalysisProvider {
  async analyze(
    input: AnalysisGenerationInput,
  ): Promise<Omit<PhotoAnalysisResult, "id" | "created_at">> {
    const messages = getMockMessages();
    const seed = hashInput(normalizeSeedSource(input.originalName));
    const basePreset = resolvePreset(messages, input.originalName, seed);
    const presetMatchSource = getPresetMatchSource(messages, input.originalName);
    const hintedPhotoStyleType = resolvePhotoStyleType(basePreset, input.originalName);
    const visualPhotoStyleType = await resolveMockVisualPhotoStyleType(input.filePath);
    const photoStyleType = visualPhotoStyleType ?? hintedPhotoStyleType;
    const preset =
      photoStyleType === hintedPhotoStyleType
        ? basePreset
        : resolvePresetForPhotoStyle(messages, photoStyleType, seed);
    const metadata = resolveAnalysisMetadata(preset, photoStyleType, seed);

    return {
      photoId: input.photoId,
      scene_type: metadata.sceneType,
      mood_category: metadata.moodCategory,
      photo_style_type: photoStyleType,
      short_review: metadata.shortReview,
      long_review: metadata.longReview,
      recommended_text_position: metadata.recommendedTextPosition,
      wallpaper_score: metadata.wallpaperScore,
      social_score: metadata.socialScore,
      commercial_score: metadata.commercialScore,
      phrases: buildScoredPhrases(
        buildPhraseCandidates(preset, seed, photoStyleType),
        messages.scoring,
        photoStyleType,
      ),
      captions: buildScoredCaptions(
        buildCaptions(preset, seed, photoStyleType),
        messages.scoring,
        photoStyleType,
      ),
      hashtags: metadata.hashtags,
      generation_source: "mock",
      generation_warning: presetMatchSource === "fallback" ? "heuristicPreset" : null,
    };
  }
}

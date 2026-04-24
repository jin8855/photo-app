import type { AnalysisGenerationInput, PhotoAnalysisProvider, PhotoAnalysisResult } from "@/lib/types/analysis";
import { getOpenAiConfig } from "@/resources/config/openai";
import { AiClientError } from "@/services/ai/ai-errors";
import { OpenAiResponsesClient } from "@/services/ai/openai-responses-client";
import { validateOpenAiImageAnalysisPayload } from "@/services/ai/openai-response-validators";
import { buildOpenAiTextGenerationPrompt } from "@/services/analyses/prompts/build-openai-text-generation-prompt";
import { buildOpenAiVisualAnalysisPrompt } from "@/services/analyses/prompts/build-openai-visual-analysis-prompt";
import {
  buildCaptions,
  buildPhrases,
  buildScoredCaptions,
  buildScoredPhrases,
  getMockMessages,
  getPresetMatchSource,
  hashInput,
  normalizeSeedSource,
  resolveAnalysisMetadata,
  resolvePresetForPhotoStyle,
  resolvePhotoStyleType,
  resolvePreset,
  uniqueByOrder,
} from "@/services/analyses/providers/analysis-preset";
import { resolveAnalysisImageReference } from "@/services/analyses/providers/analysis-image-source";

const openAiTextSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    phrases: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "string",
      },
    },
    captions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "string",
      },
    },
  },
  required: ["phrases", "captions"],
} as const;

function normalizeGeneratedCaptions(captions: string[], fallback: string[]): string[] {
  const normalized = uniqueByOrder(
    captions.map((caption) =>
      caption
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join("\n"),
    ),
  ).slice(0, 5);

  return normalized.length === 5 ? normalized : fallback;
}

function normalizeGeneratedPhrases(phrases: string[], fallback: string[]): string[] {
  const normalized = uniqueByOrder(phrases.map((phrase) => phrase.trim()).filter(Boolean)).slice(0, 10);
  return normalized.length === 10 ? normalized : fallback;
}

export class OpenAiPhotoAnalysisProvider implements PhotoAnalysisProvider {
  private readonly config = getOpenAiConfig();
  private readonly client = new OpenAiResponsesClient();

  async analyze(
    input: AnalysisGenerationInput,
  ): Promise<Omit<PhotoAnalysisResult, "id" | "created_at">> {
    const messages = getMockMessages();
    const seed = hashInput(normalizeSeedSource(input.originalName));
    const preset = resolvePreset(messages, input.originalName, seed);
    const presetMatchSource = getPresetMatchSource(messages, input.originalName);
    const photoStyleType = resolvePhotoStyleType(preset, input.originalName);
    let fallbackPreset = preset;
    let fallbackPhrases = buildPhrases(fallbackPreset, seed, photoStyleType);
    let fallbackCaptions = buildCaptions(fallbackPreset, seed, photoStyleType);
    let fallbackMetadata = resolveAnalysisMetadata(fallbackPreset, photoStyleType, seed);

    if (!this.config.apiKey) {
      return {
        photoId: input.photoId,
        scene_type: fallbackMetadata.sceneType,
        mood_category: fallbackMetadata.moodCategory,
        photo_style_type: photoStyleType,
        short_review: fallbackMetadata.shortReview,
        long_review: fallbackMetadata.longReview,
        recommended_text_position: fallbackMetadata.recommendedTextPosition,
        wallpaper_score: fallbackMetadata.wallpaperScore,
        social_score: fallbackMetadata.socialScore,
        commercial_score: fallbackMetadata.commercialScore,
        phrases: buildScoredPhrases(fallbackPhrases, messages.scoring, photoStyleType),
        captions: buildScoredCaptions(fallbackCaptions, messages.scoring, photoStyleType),
        hashtags: fallbackMetadata.hashtags,
        generation_source: "mock",
        generation_warning: "openAiKeyMissing",
      };
    }

    try {
      const imageReference = await resolveAnalysisImageReference(input.filePath);
      const visualPrompt = buildOpenAiVisualAnalysisPrompt({
        originalName: input.originalName,
      });
      const visualResponse = await this.client.createStructuredResponse({
        systemPrompt: visualPrompt.systemPrompt,
        userPrompt: visualPrompt.userPrompt,
        schemaName: visualPrompt.schemaName,
        schema: visualPrompt.schema,
        image: imageReference,
        validate: validateOpenAiImageAnalysisPayload,
      });

      const analyzed = visualResponse.payload;
      fallbackPreset = resolvePresetForPhotoStyle(messages, analyzed.photo_style_type, seed);
      fallbackPhrases = buildPhrases(fallbackPreset, seed, analyzed.photo_style_type);
      fallbackCaptions = buildCaptions(fallbackPreset, seed, analyzed.photo_style_type);
      fallbackMetadata = resolveAnalysisMetadata(
        fallbackPreset,
        analyzed.photo_style_type,
        seed,
      );

      const prompt = buildOpenAiTextGenerationPrompt({
        originalName: input.originalName,
        analysis: analyzed,
      });

      const response = await this.client.createJsonResponse({
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
        schemaName: "photo_copy_payload",
        schema: openAiTextSchema,
      });

      const phrases = normalizeGeneratedPhrases(response.payload.phrases ?? [], fallbackPhrases);
      const captions = normalizeGeneratedCaptions(response.payload.captions ?? [], fallbackCaptions);

      console.info("[ai] OpenAI text generation succeeded", {
        model: response.meta.model,
        latencyMs: response.meta.latencyMs,
        retryCount: response.meta.retryCount,
        fallbackUsed: false,
      });

      return {
        photoId: input.photoId,
        scene_type: analyzed.scene_type,
        mood_category: analyzed.mood_category,
        photo_style_type: analyzed.photo_style_type,
        short_review: analyzed.short_review,
        long_review: analyzed.long_review,
        recommended_text_position: analyzed.recommended_text_position,
        wallpaper_score: analyzed.wallpaper_score,
        social_score: analyzed.social_score,
        commercial_score: analyzed.commercial_score,
        phrases: buildScoredPhrases(phrases, messages.scoring, analyzed.photo_style_type),
        captions: buildScoredCaptions(captions, messages.scoring, analyzed.photo_style_type),
        hashtags: analyzed.hashtags.length > 0 ? analyzed.hashtags : fallbackMetadata.hashtags,
        generation_source: "openai",
        generation_warning: null,
      };
    } catch (error) {
      console.warn("[ai] OpenAI text generation fell back to mock", {
        code: error instanceof AiClientError ? error.code : "unknown",
        fallbackUsed: true,
      });

      return {
        photoId: input.photoId,
        scene_type: fallbackMetadata.sceneType,
        mood_category: fallbackMetadata.moodCategory,
        photo_style_type: photoStyleType,
        short_review: fallbackMetadata.shortReview,
        long_review: fallbackMetadata.longReview,
        recommended_text_position: fallbackMetadata.recommendedTextPosition,
        wallpaper_score: fallbackMetadata.wallpaperScore,
        social_score: fallbackMetadata.socialScore,
        commercial_score: fallbackMetadata.commercialScore,
        phrases: buildScoredPhrases(fallbackPhrases, messages.scoring, photoStyleType),
        captions: buildScoredCaptions(fallbackCaptions, messages.scoring, photoStyleType),
        hashtags: fallbackMetadata.hashtags,
        generation_source: "mock",
        generation_warning: "openAiFallbackToMock",
      };
    }
  }
}

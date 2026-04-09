import type { AnalysisGenerationInput, PhotoAnalysisProvider, PhotoAnalysisResult } from "@/lib/types/analysis";
import { getOpenAiConfig } from "@/resources/config/openai";
import { AiClientError } from "@/services/ai/ai-errors";
import { OpenAiResponsesClient } from "@/services/ai/openai-responses-client";
import { buildOpenAiTextGenerationPrompt } from "@/services/analyses/prompts/build-openai-text-generation-prompt";
import {
  buildCaptions,
  buildPhrases,
  buildScoredCaptions,
  buildScoredPhrases,
  getMockMessages,
  getPresetMatchSource,
  hashInput,
  normalizeSeedSource,
  resolvePreset,
  uniqueByOrder,
} from "@/services/analyses/providers/analysis-preset";

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
    const fallbackPhrases = buildPhrases(preset, seed);
    const fallbackCaptions = buildCaptions(preset, seed);

    if (!this.config.apiKey) {
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
        phrases: buildScoredPhrases(fallbackPhrases, messages.scoring),
        captions: buildScoredCaptions(fallbackCaptions, messages.scoring),
        hashtags: preset.hashtags,
        generation_source: "mock",
        generation_warning: "openAiKeyMissing",
      };
    }

    try {
      const response = await this.client.createJsonResponse({
        systemPrompt:
          "Generate only short emotional Korean phrases and Instagram captions. Return valid JSON only.",
        userPrompt: buildOpenAiTextGenerationPrompt({
          originalName: input.originalName,
          preset,
        }),
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
        scene_type: preset.scene_type,
        mood_category: preset.mood_category,
        short_review: preset.short_review,
        long_review: preset.long_review,
        recommended_text_position: preset.recommended_text_position,
        wallpaper_score: preset.wallpaper_score,
        social_score: preset.social_score,
        commercial_score: preset.commercial_score,
        phrases: buildScoredPhrases(phrases, messages.scoring),
        captions: buildScoredCaptions(captions, messages.scoring),
        hashtags: preset.hashtags,
        generation_source: "openai",
        generation_warning: presetMatchSource === "fallback" ? "heuristicPreset" : null,
      };
    } catch (error) {
      console.warn("[ai] OpenAI text generation fell back to mock", {
        code: error instanceof AiClientError ? error.code : "unknown",
        fallbackUsed: true,
      });

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
        phrases: buildScoredPhrases(fallbackPhrases, messages.scoring),
        captions: buildScoredCaptions(fallbackCaptions, messages.scoring),
        hashtags: preset.hashtags,
        generation_source: "mock",
        generation_warning: "openAiFallbackToMock",
      };
    }
  }
}

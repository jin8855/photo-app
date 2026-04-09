import { createTranslator } from "@/lib/i18n/translate";
import { AppError } from "@/lib/errors/app-error";
import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { GeneratedCommerceContent } from "@/lib/types/commerce";
import type { AnalysisRepository } from "@/repositories/analysis-repository";

const t = createTranslator("ko");

type CreateCommerceTitleInput = {
  overlayPhrase: string;
};

type CreateCommerceDescriptionInput = {
  sceneType: string;
  moodCategory: string;
  shortReview: string;
  longReview: string;
  phrases: string[];
  hashtags: string[];
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function formatSlug(value: string): string {
  return value.replace(/_/g, " ").trim();
}

function normalizeKeywords(items: string[]): string[] {
  const seen = new Set<string>();

  return items
    .map((item) => item.replace(/^#/, "").trim())
    .filter(Boolean)
    .filter((item) => {
      const lowered = item.toLowerCase();

      if (seen.has(lowered)) {
        return false;
      }

      seen.add(lowered);
      return true;
    })
    .slice(0, 8);
}

function pickBestUsageMessage(scores: {
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
}): string {
  const entries = [
    { key: "wallpaper", value: scores.wallpaperScore },
    { key: "social", value: scores.socialScore },
    { key: "commercial", value: scores.commercialScore },
  ].sort((left, right) => right.value - left.value);

  return t(`commerceGenerator.usage.${entries[0]?.key ?? "social"}`);
}

function pickRecommendedForMessage(scores: {
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
}): string {
  const entries = [
    { key: "wallpaper", value: scores.wallpaperScore },
    { key: "social", value: scores.socialScore },
    { key: "commercial", value: scores.commercialScore },
  ].sort((left, right) => right.value - left.value);

  return t(`commerceGenerator.recommendedFor.${entries[0]?.key ?? "social"}`);
}

function buildKeywordSeed(input: CreateCommerceDescriptionInput): string[] {
  return normalizeKeywords([
    ...input.hashtags,
    formatSlug(input.sceneType),
    formatSlug(input.moodCategory),
    t("commerceGenerator.keywords.baseImage"),
    t("commerceGenerator.keywords.basePoster"),
    t("commerceGenerator.keywords.baseMood"),
  ]);
}

export function createProductTitle(input: CreateCommerceTitleInput): string {
  const phrase = normalizeWhitespace(input.overlayPhrase);

  if (!phrase) {
    return t("commerceGenerator.fallbackTitle");
  }

  return `${phrase} | ${t("commerceGenerator.titleSuffix")}`.trim();
}

export function createProductDescription(
  input: CreateCommerceDescriptionInput,
): Omit<GeneratedCommerceContent, "productTitle"> {
  const oneLineIntro = normalizeWhitespace(
    input.phrases[0] ?? input.shortReview ?? t("commerceGenerator.fallbackIntro"),
  );
  const supportingPhrase = normalizeWhitespace(input.phrases[1] ?? input.shortReview);
  const productDescription = [
    t("commerceGenerator.description.lead"),
    input.longReview,
    supportingPhrase ? `${t("commerceGenerator.description.support")}${supportingPhrase}` : "",
    t("commerceGenerator.description.tail"),
  ]
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
    .join("\n\n");
  const usageGuide = [
    pickBestUsageMessage({
      wallpaperScore: input.wallpaperScore,
      socialScore: input.socialScore,
      commercialScore: input.commercialScore,
    }),
    t("commerceGenerator.usage.common"),
  ]
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
    .join("\n");
  const recommendedFor = [
    pickRecommendedForMessage({
      wallpaperScore: input.wallpaperScore,
      socialScore: input.socialScore,
      commercialScore: input.commercialScore,
    }),
    t("commerceGenerator.recommendedFor.common"),
  ]
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean)
    .join("\n");

  return {
    oneLineIntro,
    productDescription,
    usageGuide,
    recommendedFor,
    keywords: buildKeywordSeed(input),
  };
}

export class CommerceContentService {
  constructor(private readonly analysisRepository?: AnalysisRepository) {}

  generateFromAnalysis(analysis: PhotoAnalysisResult): GeneratedCommerceContent {
    return {
      productTitle: createProductTitle({
        overlayPhrase: analysis.phrases[0]?.phrase ?? analysis.short_review,
      }),
      ...createProductDescription({
        sceneType: analysis.scene_type,
        moodCategory: analysis.mood_category,
        shortReview: analysis.short_review,
        longReview: analysis.long_review,
        phrases: analysis.phrases.map((item) => item.phrase),
        hashtags: analysis.hashtags,
        wallpaperScore: analysis.wallpaper_score,
        socialScore: analysis.social_score,
        commercialScore: analysis.commercial_score,
      }),
    };
  }

  async generateAndSaveFromAnalysis(
    analysisId: number,
    analysis: PhotoAnalysisResult,
  ): Promise<GeneratedCommerceContent> {
    const payload = this.generateFromAnalysis(analysis);

    try {
      const saved = await this.analysisRepository?.saveGeneratedCommerceContent(
        analysisId,
        JSON.stringify(payload),
      );

      if (this.analysisRepository && !saved) {
        throw new AppError({
          code: "commerceSaveFailed",
          status: 500,
          message: "Generated commerce content was not persisted.",
          details: {
            analysisId,
          },
        });
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: "commerceSaveFailed",
        status: 500,
        message: "Failed to persist generated commerce content.",
        details: {
          analysisId,
        },
        cause: error,
      });
    }

    return payload;
  }
}

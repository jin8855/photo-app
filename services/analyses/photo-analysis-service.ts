import {
  normalizeScoredCaptions,
  normalizeScoredPhrases,
  type PhotoAnalysisProvider,
  type PhotoAnalysisResult,
} from "@/lib/types/analysis";
import { AppError } from "@/lib/errors/app-error";
import type { AnalysisRepository } from "@/repositories/analysis-repository";
import type { PhotoRepository } from "@/repositories/photo-repository";

export class PhotoAnalysisService {
  constructor(
    private readonly provider: PhotoAnalysisProvider,
    private readonly analysisRepository: AnalysisRepository,
    private readonly photoRepository: PhotoRepository,
  ) {}

  async analyzePhoto(photoId: number): Promise<PhotoAnalysisResult> {
    const photo = await this.photoRepository.getPhotoById(photoId);

    if (!photo) {
      throw new AppError({
        code: "photoNotFound",
        status: 404,
        message: "Photo was not found.",
        details: {
          photoId,
        },
      });
    }

    let generated;

    try {
      generated = await this.provider.analyze({
        photoId: photo.id,
        originalName: photo.originalName,
        filePath: photo.filePath,
      });
    } catch (error) {
      throw new AppError({
        code: "analyzeFailed",
        status: 500,
        message: "Failed to generate analysis content.",
        details: {
          photoId,
          filePath: photo.filePath,
        },
        cause: error,
      });
    }

    let saved;

    try {
      saved = await this.analysisRepository.saveAnalysis({
        photoId: generated.photoId,
        sceneType: generated.scene_type,
        moodCategory: generated.mood_category,
        shortReview: generated.short_review,
        longReview: generated.long_review,
        recommendedTextPosition: generated.recommended_text_position,
        wallpaperScore: generated.wallpaper_score,
        socialScore: generated.social_score,
        commercialScore: generated.commercial_score,
        phrasesJson: JSON.stringify(generated.phrases),
        captionsJson: JSON.stringify(generated.captions),
        hashtagsJson: JSON.stringify(generated.hashtags),
        generationSource: generated.generation_source,
        generationWarning: generated.generation_warning,
      });
    } catch (error) {
      throw new AppError({
        code: "analysisSaveFailed",
        status: 500,
        message: "Failed to persist analysis result.",
        details: {
          photoId,
          generationSource: generated.generation_source,
        },
        cause: error,
      });
    }

    return {
      id: saved.id,
      photoId: saved.photoId,
      scene_type: saved.sceneType,
      mood_category: saved.moodCategory,
      short_review: saved.shortReview,
      long_review: saved.longReview,
      recommended_text_position: saved.recommendedTextPosition,
      wallpaper_score: saved.wallpaperScore,
      social_score: saved.socialScore,
      commercial_score: saved.commercialScore,
      phrases: normalizeScoredPhrases(JSON.parse(saved.phrasesJson)),
      captions: normalizeScoredCaptions(JSON.parse(saved.captionsJson)),
      hashtags: JSON.parse(saved.hashtagsJson) as string[],
      generation_source: saved.generationSource === "openai" ? "openai" : "mock",
      generation_warning: saved.generationWarning,
      created_at: saved.createdAt,
    };
  }
}

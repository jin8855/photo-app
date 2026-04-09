import fs from "node:fs/promises";
import path from "node:path";

import type {
  CreateInstagramContentSetInput,
  GeneratedContentSetPayload,
} from "@/lib/types/content";
import { AppError } from "@/lib/errors/app-error";
import type { AnalysisRepository } from "@/repositories/analysis-repository";
import { renderInstagramContentSvg } from "@/services/content/content-image-renderer";

function toBaseName(originalName: string): string {
  return originalName.replace(/\.[^.]+$/, "").trim() || "content";
}

function toMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  if (extension === ".gif") {
    return "image/gif";
  }

  return "image/jpeg";
}

function normalizePublicImagePath(filePath: string): string {
  const normalized = filePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", normalized);
  const publicRoot = path.join(process.cwd(), "public");

  if (!absolutePath.startsWith(publicRoot)) {
    throw new AppError({
      code: "contentSetFailed",
      status: 400,
      message: "Content image path is invalid.",
      details: {
        filePath,
      },
    });
  }

  return absolutePath;
}

async function readImageAsDataUrl(filePath: string): Promise<string> {
  const absolutePath = normalizePublicImagePath(filePath);
  const buffer = await fs.readFile(absolutePath);
  const mimeType = toMimeType(absolutePath);

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export class InstagramContentService {
  constructor(private readonly analysisRepository?: AnalysisRepository) {}

  async createFromPublicImage(
    imagePath: string,
    input: CreateInstagramContentSetInput,
  ): Promise<GeneratedContentSetPayload> {
    const imageDataUrl = await readImageAsDataUrl(imagePath);
    const imageSvg = renderInstagramContentSvg({
      imageDataUrl,
      overlayText: input.overlayText,
      moodCategory: input.moodCategory,
      overlayStyle: input.overlayStyle,
    });
    const captionText = input.captionText.trim();
    const hashtagText = input.hashtagText.trim();
    const combinedText = [captionText, hashtagText].filter(Boolean).join("\n\n");
    const imageFileName = `${toBaseName(input.originalName)}-instagram-set.svg`;

    return {
      imageSvg,
      imageFileName,
      overlayText: input.overlayText,
      captionText,
      hashtagText,
      combinedText,
      overlayStyle: input.overlayStyle,
      renderVariant: input.renderVariant ?? 0,
    };
  }

  async createAndSaveFromPublicImage(
    analysisId: number,
    imagePath: string,
    input: CreateInstagramContentSetInput,
  ): Promise<GeneratedContentSetPayload> {
    const payload = await this.createFromPublicImage(imagePath, input);

    try {
      const saved = await this.analysisRepository?.saveGeneratedContentSet(
        analysisId,
        JSON.stringify(payload),
      );

      if (this.analysisRepository && !saved) {
        throw new AppError({
          code: "contentSetSaveFailed",
          status: 500,
          message: "Generated content set was not persisted.",
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
        code: "contentSetSaveFailed",
        status: 500,
        message: "Failed to persist generated content set.",
        details: {
          analysisId,
        },
        cause: error,
      });
    }

    return payload;
  }
}

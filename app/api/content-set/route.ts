import { NextResponse } from "next/server";

import type { CreateInstagramContentSetInput } from "@/lib/types/content";
import { toAppError } from "@/lib/errors/app-error";
import { createRequestId, withRequestId } from "@/lib/http/request-id";
import { logServerError, logServerWarn } from "@/lib/logging/app-logger";
import { createInstagramContentService } from "@/services/app/app-service-factory";

export const runtime = "nodejs";

type ContentSetRequest = {
  analysisId: number;
  imageUrl: string;
} & CreateInstagramContentSetInput;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  const requestId = createRequestId();

  try {
    const payload = (await request.json()) as ContentSetRequest;

    if (
      !isObject(payload) ||
      typeof payload.analysisId !== "number" ||
      typeof payload.imageUrl !== "string" ||
      typeof payload.originalName !== "string" ||
      typeof payload.overlayText !== "string" ||
      typeof payload.captionText !== "string" ||
      typeof payload.hashtagText !== "string" ||
      typeof payload.moodCategory !== "string" ||
      !isObject(payload.overlayStyle)
    ) {
      logServerWarn("api.contentSet.invalidRequest", {
        reason: "invalid_payload_shape",
        requestId,
      });
      return withRequestId(
        NextResponse.json(
        { ok: false, errorCode: "contentSetFailed" },
        { status: 400 },
        ),
        requestId,
      );
    }

    const service = createInstagramContentService();
    const result = await service.createAndSaveFromPublicImage(payload.analysisId, payload.imageUrl, {
      originalName: payload.originalName,
      overlayText: payload.overlayText,
      captionText: payload.captionText,
      hashtagText: payload.hashtagText,
      moodCategory: payload.moodCategory,
      overlayStyle: payload.overlayStyle as CreateInstagramContentSetInput["overlayStyle"],
      renderVariant: payload.renderVariant,
    });

    return withRequestId(
      NextResponse.json({
        ok: true,
        data: result,
      }),
      requestId,
    );
  } catch (error) {
    const appError = toAppError(error, {
      code: "contentSetFailed",
      status: 500,
      message: "Unexpected content set route failure.",
    });

    logServerError("api.contentSet.failed", appError, {
      route: "/api/content-set",
      requestId,
    });

    return withRequestId(
      NextResponse.json(
        { ok: false, errorCode: appError.code },
        { status: appError.status },
      ),
      requestId,
    );
  }
}

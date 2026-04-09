import { NextResponse } from "next/server";

import { toAppError } from "@/lib/errors/app-error";
import { createRequestId, withRequestId } from "@/lib/http/request-id";
import { logServerError, logServerWarn } from "@/lib/logging/app-logger";
import { createPhotoAnalysisService } from "@/services/app/app-service-factory";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    photoId: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const requestId = createRequestId();

  try {
    const { photoId } = await context.params;
    const parsedPhotoId = Number(photoId);

    if (!Number.isInteger(parsedPhotoId) || parsedPhotoId <= 0) {
      logServerWarn("api.photos.analyze.invalidRequest", {
        photoId,
        requestId,
      });
      return withRequestId(
        NextResponse.json(
        { ok: false, errorCode: "photoNotFound" },
        { status: 404 },
        ),
        requestId,
      );
    }

    const service = createPhotoAnalysisService();
    const result = await service.analyzePhoto(parsedPhotoId);

    return withRequestId(
      NextResponse.json({
        ok: true,
        data: result,
      }),
      requestId,
    );
  } catch (error) {
    const appError = toAppError(error, {
      code: "unknown",
      status: 500,
      message: "Unexpected analysis route failure.",
    });

    logServerError("api.photos.analyze.failed", appError, {
      route: "/api/photos/[photoId]/analyze",
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

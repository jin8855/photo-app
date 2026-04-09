import { NextResponse } from "next/server";

import { createRequestId, withRequestId } from "@/lib/http/request-id";
import { logServerError, logServerWarn } from "@/lib/logging/app-logger";
import { createPhotoDeleteService } from "@/services/app/app-service-factory";

export const runtime = "nodejs";

function parsePhotoId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ photoId: string }> },
) {
  const requestId = createRequestId();

  try {
    const { photoId } = await context.params;
    const parsedPhotoId = parsePhotoId(photoId);

    if (!parsedPhotoId) {
      logServerWarn("api.photos.delete.invalidRequest", {
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

    const service = createPhotoDeleteService();
    const deleted = await service.delete(parsedPhotoId);

    if (!deleted) {
      return withRequestId(
        NextResponse.json(
        { ok: false, errorCode: "photoNotFound" },
        { status: 404 },
        ),
        requestId,
      );
    }

    return withRequestId(NextResponse.json({ ok: true }), requestId);
  } catch (error) {
    logServerError("api.photos.delete.failed", error, {
      route: "/api/photos/[photoId]",
      requestId,
    });

    return withRequestId(
      NextResponse.json(
        { ok: false, errorCode: "deleteFailed" },
        { status: 500 },
      ),
      requestId,
    );
  }
}

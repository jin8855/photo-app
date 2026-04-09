import { NextResponse } from "next/server";

import { toAppError } from "@/lib/errors/app-error";
import { createRequestId, withRequestId } from "@/lib/http/request-id";
import { logServerError, logServerWarn } from "@/lib/logging/app-logger";
import { createPhotoUploadService } from "@/services/app/app-service-factory";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = createRequestId();

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("photo");

    if (!(fileEntry instanceof File)) {
      logServerWarn("api.photos.upload.invalidRequest", {
        reason: "missing_file",
        requestId,
      });
      return withRequestId(
        NextResponse.json(
        { ok: false, errorCode: "noFile" },
        { status: 400 },
        ),
        requestId,
      );
    }

    const service = createPhotoUploadService();
    const uploaded = await service.upload(fileEntry);

    return withRequestId(
      NextResponse.json({
        ok: true,
        data: uploaded,
      }),
      requestId,
    );
  } catch (error) {
    const appError = toAppError(error, {
      code: "unknown",
      status: 500,
      message: "Unexpected upload route failure.",
    });

    logServerError("api.photos.upload.failed", appError, {
      route: "/api/photos/upload",
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

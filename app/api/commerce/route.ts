import { NextResponse } from "next/server";

import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import { toAppError } from "@/lib/errors/app-error";
import { createRequestId, withRequestId } from "@/lib/http/request-id";
import { logServerError, logServerWarn } from "@/lib/logging/app-logger";
import { createCommerceContentService } from "@/services/app/app-service-factory";

export const runtime = "nodejs";

type CommerceRequest = {
  analysisId: number;
  analysis: PhotoAnalysisResult;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  const requestId = createRequestId();

  try {
    const payload = (await request.json()) as CommerceRequest;

    if (
      !isObject(payload) ||
      typeof payload.analysisId !== "number" ||
      !isObject(payload.analysis)
    ) {
      logServerWarn("api.commerce.invalidRequest", {
        reason: "invalid_payload_shape",
        requestId,
      });
      return withRequestId(
        NextResponse.json(
        { ok: false, errorCode: "commerceFailed" },
        { status: 400 },
        ),
        requestId,
      );
    }

    const service = createCommerceContentService();
    const result = await service.generateAndSaveFromAnalysis(
      payload.analysisId,
      payload.analysis as PhotoAnalysisResult,
    );

    return withRequestId(
      NextResponse.json({
        ok: true,
        data: result,
      }),
      requestId,
    );
  } catch (error) {
    const appError = toAppError(error, {
      code: "commerceFailed",
      status: 500,
      message: "Unexpected commerce route failure.",
    });

    logServerError("api.commerce.failed", appError, {
      route: "/api/commerce",
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

import type { PhotoAnalysisResult } from "@/lib/types/analysis";

type AnalyzeSuccess = {
  ok: true;
  data: PhotoAnalysisResult;
};

type AnalyzeFailure = {
  ok: false;
  errorCode: "photoNotFound" | "analyzeFailed" | "analysisSaveFailed" | "unknown";
};

export async function analyzePhoto(photoId: number): Promise<AnalyzeSuccess | AnalyzeFailure> {
  const response = await fetch(`/api/photos/${photoId}/analyze`, {
    method: "POST",
  });

  return (await response.json()) as AnalyzeSuccess | AnalyzeFailure;
}

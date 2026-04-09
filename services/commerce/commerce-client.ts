import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import type { GeneratedCommerceContent } from "@/lib/types/commerce";

type GenerateCommerceSuccess = {
  ok: true;
  data: GeneratedCommerceContent;
};

type GenerateCommerceFailure = {
  ok: false;
  errorCode: "commerceFailed" | "commerceSaveFailed" | "unknown";
};

export async function generateCommerceContent(
  analysisId: number,
  analysis: PhotoAnalysisResult,
): Promise<GenerateCommerceSuccess | GenerateCommerceFailure> {
  const response = await fetch("/api/commerce", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ analysisId, analysis }),
  });

  return (await response.json()) as GenerateCommerceSuccess | GenerateCommerceFailure;
}

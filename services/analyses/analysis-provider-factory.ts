import type { PhotoAnalysisProvider } from "@/lib/types/analysis";
import { MockPhotoAnalysisProvider } from "@/services/analyses/providers/mock-photo-analysis-provider";
import { OpenAiPhotoAnalysisProvider } from "@/services/analyses/providers/openai-photo-analysis-provider";
import { getAppRuntimeConfig } from "@/resources/config/app-runtime";

export function createPhotoAnalysisProvider(): PhotoAnalysisProvider {
  const runtime = getAppRuntimeConfig();

  switch (runtime.analysisProvider) {
    case "openai":
      return new OpenAiPhotoAnalysisProvider();
    case "mock":
      return new MockPhotoAnalysisProvider();
  }
}

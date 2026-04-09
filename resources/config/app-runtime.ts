import { validateAppConfig } from "@/config/app/env-validation";
import type { AppRuntimeConfig } from "@/lib/types/app-runtime";
import { hasOpenAiApiKey } from "@/resources/config/openai";

export function getAppRuntimeConfig(): AppRuntimeConfig {
  const configuredAnalysisProvider =
    process.env.ANALYSIS_PROVIDER === "openai" || process.env.ANALYSIS_PROVIDER === "mock"
      ? process.env.ANALYSIS_PROVIDER
      : undefined;
  const configuredDatabaseProvider =
    process.env.DB_PROVIDER === "mssql" || process.env.DB_PROVIDER === "postgres"
      ? process.env.DB_PROVIDER
      : undefined;
  const configuredStorageProvider =
    process.env.STORAGE_PROVIDER === "local-public" || process.env.STORAGE_PROVIDER === "supabase-storage"
      ? process.env.STORAGE_PROVIDER
      : undefined;

  const runtimeConfig = {
    databaseProvider: configuredDatabaseProvider ?? "mssql",
    storageProvider: configuredStorageProvider ?? "local-public",
    analysisProvider: configuredAnalysisProvider ?? (hasOpenAiApiKey() ? "openai" : "mock"),
    authMode: "guest",
    billingMode: "prepared",
  } satisfies AppRuntimeConfig;

  validateAppConfig(runtimeConfig);

  return runtimeConfig;
}

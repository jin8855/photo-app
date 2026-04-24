import { validateAppConfig } from "@/config/app/env-validation";
import type { AppRuntimeConfig } from "@/lib/types/app-runtime";
import { hasOpenAiApiKey } from "@/resources/config/openai";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string"
    ? value.replace(/\\r/g, "").replace(/\\n/g, "").trim()
    : undefined;
}

function isAnalysisProvider(value: string | undefined): value is AppRuntimeConfig["analysisProvider"] {
  return value === "openai" || value === "mock";
}

function isDatabaseProvider(value: string | undefined): value is AppRuntimeConfig["databaseProvider"] {
  return value === "mssql" || value === "postgres";
}

function isStorageProvider(value: string | undefined): value is AppRuntimeConfig["storageProvider"] {
  return value === "local-public" || value === "supabase-storage";
}

export function getAppRuntimeConfig(): AppRuntimeConfig {
  const analysisProviderEnv = readEnv("ANALYSIS_PROVIDER");
  const databaseProviderEnv = readEnv("DB_PROVIDER");
  const storageProviderEnv = readEnv("STORAGE_PROVIDER");

  const configuredAnalysisProvider = isAnalysisProvider(analysisProviderEnv)
    ? analysisProviderEnv
    : undefined;
  const configuredDatabaseProvider = isDatabaseProvider(databaseProviderEnv)
    ? databaseProviderEnv
    : undefined;
  const configuredStorageProvider = isStorageProvider(storageProviderEnv)
    ? storageProviderEnv
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

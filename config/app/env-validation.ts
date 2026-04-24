import type { AppRuntimeConfig } from "@/lib/types/app-runtime";

function isPresent(value: string | undefined): boolean {
  return Boolean(value && value.trim());
}

export function validateAppConfig(runtime: AppRuntimeConfig): void {
  if (runtime.databaseProvider === "mssql") {
    const hasConnectionString = isPresent(process.env.MSSQL_CONNECTION_STRING);
    const hasLocalDbFallback = process.env.NODE_ENV !== "production";

    if (!hasConnectionString && !hasLocalDbFallback) {
      throw new Error(
        "configMissing:MSSQL_CONNECTION_STRING|LOCAL_SQLSERVER_INSTANCE",
      );
    }
  }

  if (runtime.databaseProvider === "postgres" && !isPresent(process.env.POSTGRES_URL)) {
    throw new Error("configMissing:POSTGRES_URL");
  }

  if (runtime.storageProvider === "supabase-storage") {
    const missingKeys = [
      !isPresent(process.env.SUPABASE_URL) ? "SUPABASE_URL" : null,
      !isPresent(process.env.SUPABASE_SERVICE_ROLE_KEY) ? "SUPABASE_SERVICE_ROLE_KEY" : null,
      !isPresent(process.env.SUPABASE_STORAGE_BUCKET) ? "SUPABASE_STORAGE_BUCKET" : null,
    ].filter((value): value is string => Boolean(value));

    if (missingKeys.length > 0) {
      throw new Error(`configMissing:${missingKeys.join("|")}`);
    }
  }
}

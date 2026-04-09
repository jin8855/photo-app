import { ensureMssqlDatabaseReady } from "@/db/mssql/mssql-bootstrapper";
import { ensurePostgresDatabaseReady } from "@/db/postgres/postgres-bootstrapper";
import { getAppRuntimeConfig } from "@/resources/config/app-runtime";

export function ensureApplicationDatabaseReady(): void {
  const runtime = getAppRuntimeConfig();

  switch (runtime.databaseProvider) {
    case "mssql":
      ensureMssqlDatabaseReady();
      return;
    case "postgres":
      ensurePostgresDatabaseReady();
      return;
  }
}

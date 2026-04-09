import { ensureAnalysesTableReady, ensurePhotosTableReady } from "@/db/mssql/init";

export function ensureMssqlDatabaseReady(): void {
  ensurePhotosTableReady();
  ensureAnalysesTableReady();
}

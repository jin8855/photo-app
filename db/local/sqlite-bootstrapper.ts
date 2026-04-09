import { initializeDatabase } from "@/db/init";

export function ensureSqliteDatabaseReady(): void {
  initializeDatabase();
}

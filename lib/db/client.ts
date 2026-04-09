import Database from "better-sqlite3";

import { getDatabasePath } from "@/lib/db/config";

let databaseInstance: Database.Database | null = null;

export function createDatabaseConnection(databasePath = getDatabasePath()): Database.Database {
  const database = new Database(databasePath);

  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("synchronous = NORMAL");

  return database;
}

export function getDatabase(): Database.Database {
  if (!databaseInstance) {
    databaseInstance = createDatabaseConnection();
  }

  return databaseInstance;
}

export function closeDatabase(): void {
  if (databaseInstance) {
    databaseInstance.close();
    databaseInstance = null;
  }
}

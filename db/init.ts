import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createDatabaseConnection } from "@/lib/db/client";
import { getDatabasePath } from "@/lib/db/config";

function ensureDatabaseDirectory(databasePath: string): void {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

function readSchema(): string {
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  return fs.readFileSync(schemaPath, "utf8");
}

export function initializeDatabase(): string {
  const databasePath = getDatabasePath();
  ensureDatabaseDirectory(databasePath);

  const database = createDatabaseConnection(databasePath);

  try {
    database.exec(readSchema());
  } finally {
    database.close();
  }

  return databasePath;
}

const currentFilePath = fileURLToPath(import.meta.url);
const executedFromCli =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath);

if (executedFromCli) {
  const databasePath = initializeDatabase();
  console.log(`Database initialized at ${databasePath}`);
}

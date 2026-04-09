import path from "node:path";

const defaultDatabasePath = path.join(process.cwd(), "db", "local", "photo-caption.db");

export function getDatabasePath(): string {
  return process.env.PHOTO_CAPTION_DB_PATH ?? defaultDatabasePath;
}

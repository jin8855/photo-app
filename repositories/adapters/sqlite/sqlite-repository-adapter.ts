import { getDatabase } from "@/lib/db/client";
import type { DatabaseRepositoryAdapter } from "@/repositories/adapters/database-repository-adapter";
import { SqliteAnalysisRepository } from "@/repositories/local/sqlite-analysis-repository";
import { SqliteHistoryRepository } from "@/repositories/local/sqlite-history-repository";
import { SqlitePhotoRepository } from "@/repositories/local/sqlite-photo-repository";

export function createSqliteRepositoryAdapter(): DatabaseRepositoryAdapter {
  const database = getDatabase();

  return {
    photoRepository: new SqlitePhotoRepository(database),
    analysisRepository: new SqliteAnalysisRepository(database),
    historyRepository: new SqliteHistoryRepository(database),
  };
}

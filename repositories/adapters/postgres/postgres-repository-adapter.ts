import type { DatabaseRepositoryAdapter } from "@/repositories/adapters/database-repository-adapter";
import { PostgresAnalysisRepository } from "@/repositories/postgres/postgres-analysis-repository";
import { PostgresHistoryRepository } from "@/repositories/postgres/postgres-history-repository";
import { PostgresPhotoRepository } from "@/repositories/postgres/postgres-photo-repository";

export function createPostgresRepositoryAdapter(): DatabaseRepositoryAdapter {
  // TODO(postgres):
  // Replace the placeholder repositories below with real implementations
  // after wiring a Postgres/Supabase client and finalizing the schema.
  return {
    photoRepository: new PostgresPhotoRepository(),
    analysisRepository: new PostgresAnalysisRepository(),
    historyRepository: new PostgresHistoryRepository(),
  };
}

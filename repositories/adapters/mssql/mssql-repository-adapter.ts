import type { DatabaseRepositoryAdapter } from "@/repositories/adapters/database-repository-adapter";
import {
  LocalMssqlQueryRunner,
  MssqlAnalysisRepository,
  MssqlHistoryRepository,
  MssqlPhotoRepository,
} from "@/repositories/mssql/mssql-repository-module";

export function createMssqlRepositoryAdapter(): DatabaseRepositoryAdapter {
  const queryRunner = new LocalMssqlQueryRunner();

  return {
    photoRepository: new MssqlPhotoRepository(queryRunner),
    analysisRepository: new MssqlAnalysisRepository(queryRunner),
    historyRepository: new MssqlHistoryRepository(queryRunner),
  };
}

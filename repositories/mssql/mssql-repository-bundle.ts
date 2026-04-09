import type { RepositoryBundle } from "@/repositories/repository-bundle";
import { MssqlAnalysisRepository } from "@/repositories/mssql/mssql-analysis-repository";
import { MssqlHistoryRepository } from "@/repositories/mssql/mssql-history-repository";
import { MssqlPhotoRepository } from "@/repositories/mssql/mssql-photo-repository";
import { LocalMssqlQueryRunner } from "@/repositories/mssql/mssql-query-runner";

export function createMssqlRepositoryBundle(): RepositoryBundle {
  const queryRunner = new LocalMssqlQueryRunner();

  return {
    photoRepository: new MssqlPhotoRepository(queryRunner),
    analysisRepository: new MssqlAnalysisRepository(queryRunner),
    historyRepository: new MssqlHistoryRepository(queryRunner),
  };
}

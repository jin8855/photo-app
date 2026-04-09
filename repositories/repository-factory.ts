import type { AnalysisRepository } from "@/repositories/analysis-repository";
import type { HistoryRepository } from "@/repositories/history-repository";
import { createMssqlRepositoryAdapter } from "@/repositories/adapters/mssql/mssql-repository-adapter";
import { createPostgresRepositoryAdapter } from "@/repositories/adapters/postgres/postgres-repository-adapter";
import type { PhotoRepository } from "@/repositories/photo-repository";
import type { RepositoryBundle } from "@/repositories/repository-bundle";
import { getAppRuntimeConfig } from "@/resources/config/app-runtime";

export function createRepositoryBundle(): RepositoryBundle {
  const runtime = getAppRuntimeConfig();

  switch (runtime.databaseProvider) {
    case "mssql":
      return createMssqlRepositoryAdapter();
    case "postgres":
      return createPostgresRepositoryAdapter();
  }
}

export function createPhotoRepository(): PhotoRepository {
  return createRepositoryBundle().photoRepository;
}

export function createAnalysisRepository(): AnalysisRepository {
  return createRepositoryBundle().analysisRepository;
}

export function createHistoryRepository(): HistoryRepository {
  return createRepositoryBundle().historyRepository;
}

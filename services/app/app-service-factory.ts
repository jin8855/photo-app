import { ensureApplicationDatabaseReady } from "@/db/database-bootstrap";
import { createRepositoryBundle } from "@/repositories/repository-factory";
import { AccessControlService } from "@/services/access/access-control-service";
import { FeatureFlagService } from "@/services/access/feature-flag-service";
import { PlanService } from "@/services/access/plan-service";
import { UsagePolicyService } from "@/services/access/usage-policy-service";
import { createPhotoAnalysisProvider } from "@/services/analyses/analysis-provider-factory";
import { getCurrentUserContext } from "@/services/auth/user-context-service";
import { PhotoAnalysisService } from "@/services/analyses/photo-analysis-service";
import { HistoryService } from "@/services/history/history-service";
import { PhotoDeleteService } from "@/services/photos/photo-delete-service";
import { PhotoUploadService } from "@/services/photos/photo-upload-service";
import { InstagramContentService } from "@/services/content/content-service";
import { CommerceContentService } from "@/services/commerce/commerce-service";
import { createPhotoStorage } from "@/services/storage/storage-factory";

export function createPhotoUploadService(): PhotoUploadService {
  ensureApplicationDatabaseReady();
  const repositories = createRepositoryBundle();
  return new PhotoUploadService(repositories.photoRepository, createPhotoStorage());
}

export function createPhotoAnalysisService(): PhotoAnalysisService {
  ensureApplicationDatabaseReady();
  const repositories = createRepositoryBundle();
  return new PhotoAnalysisService(
    createPhotoAnalysisProvider(),
    repositories.analysisRepository,
    repositories.photoRepository,
  );
}

export function createHistoryService(): HistoryService {
  ensureApplicationDatabaseReady();
  return new HistoryService(createRepositoryBundle().historyRepository);
}

export function createPhotoDeleteService(): PhotoDeleteService {
  ensureApplicationDatabaseReady();
  return new PhotoDeleteService(createRepositoryBundle().photoRepository, createPhotoStorage());
}

export function createInstagramContentService(): InstagramContentService {
  ensureApplicationDatabaseReady();
  return new InstagramContentService(createRepositoryBundle().analysisRepository);
}

export function createCommerceContentService(): CommerceContentService {
  ensureApplicationDatabaseReady();
  return new CommerceContentService(createRepositoryBundle().analysisRepository);
}

export function createAccessControlService(): AccessControlService {
  return new AccessControlService(
    new PlanService(),
    new FeatureFlagService(),
    new UsagePolicyService(),
  );
}

export function getCurrentUserAccessSnapshot() {
  return createAccessControlService().getAccessSnapshot(getCurrentUserContext());
}

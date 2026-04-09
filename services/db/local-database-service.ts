import { getDatabase } from "@/lib/db/client";
import { SqliteAnalysisRepository } from "@/repositories/local/sqlite-analysis-repository";
import { SqlitePhotoRepository } from "@/repositories/local/sqlite-photo-repository";
import { AnalysisRecordService } from "@/services/analyses/analysis-record-service";
import { PhotoRecordService } from "@/services/photos/photo-record-service";

export function createLocalDatabaseServices() {
  const database = getDatabase();
  const photoRepository = new SqlitePhotoRepository(database);
  const analysisRepository = new SqliteAnalysisRepository(database);

  return {
    photoService: new PhotoRecordService(photoRepository),
    analysisService: new AnalysisRecordService(analysisRepository, photoRepository),
  };
}

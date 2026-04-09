import type { AnalysisRecord, CreateAnalysisInput } from "@/lib/types/database";
import type { AnalysisRepository } from "@/repositories/analysis-repository";
import type { MssqlQueryRunner } from "@/repositories/mssql/mssql-query-runner";
import { LocalMssqlQueryRunner } from "@/repositories/mssql/mssql-query-runner";
import {
  buildFindAnalysisByIdQuery,
  buildInsertAnalysisQuery,
  buildListAnalysesByPhotoIdQuery,
  buildUpdateGeneratedCommerceContentQuery,
  buildUpdateGeneratedContentSetQuery,
} from "@/repositories/mssql/queries/analysis-queries";

type JsonAnalysisRow = {
  id: number;
  photoId: number;
  sceneType: string;
  moodCategory: string;
  shortReview: string;
  longReview: string;
  recommendedTextPosition: string;
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
  phrasesJson: string;
  captionsJson: string;
  hashtagsJson: string;
  generationSource: string;
  generationWarning: string | null;
  contentSetJson: string | null;
  commerceContentJson: string | null;
  createdAt: string;
};

function mapAnalysisRow(row: JsonAnalysisRow): AnalysisRecord {
  return {
    id: row.id,
    photoId: row.photoId,
    sceneType: row.sceneType,
    moodCategory: row.moodCategory,
    shortReview: row.shortReview,
    longReview: row.longReview,
    recommendedTextPosition: row.recommendedTextPosition,
    wallpaperScore: row.wallpaperScore,
    socialScore: row.socialScore,
    commercialScore: row.commercialScore,
    phrasesJson: row.phrasesJson,
    captionsJson: row.captionsJson,
    hashtagsJson: row.hashtagsJson,
    generationSource: row.generationSource,
    generationWarning: row.generationWarning,
    contentSetJson: row.contentSetJson,
    commerceContentJson: row.commerceContentJson,
    createdAt: row.createdAt,
  };
}

function parseSingleAnalysis(jsonOutput: string): AnalysisRecord | null {
  const trimmed = jsonOutput.trim();
  if (!trimmed) {
    return null;
  }

  return mapAnalysisRow(JSON.parse(trimmed) as JsonAnalysisRow);
}

function parseAnalysisList(jsonOutput: string): AnalysisRecord[] {
  const trimmed = jsonOutput.trim();
  if (!trimmed) {
    return [];
  }

  return (JSON.parse(trimmed) as JsonAnalysisRow[]).map(mapAnalysisRow);
}

export class MssqlAnalysisRepository implements AnalysisRepository {
  constructor(private readonly queryRunner: MssqlQueryRunner = new LocalMssqlQueryRunner()) {}

  async saveAnalysis(input: CreateAnalysisInput): Promise<AnalysisRecord> {
    const result = this.queryRunner.run(buildInsertAnalysisQuery(input));

    const analysis = parseSingleAnalysis(result);
    if (!analysis) {
      throw new Error("Failed to insert analysis metadata.");
    }

    return analysis;
  }

  async saveGeneratedContentSet(
    analysisId: number,
    contentSetJson: string,
  ): Promise<AnalysisRecord | null> {
    const result = this.queryRunner.run(buildUpdateGeneratedContentSetQuery(analysisId, contentSetJson));
    return parseSingleAnalysis(result);
  }

  async saveGeneratedCommerceContent(
    analysisId: number,
    commerceContentJson: string,
  ): Promise<AnalysisRecord | null> {
    const result = this.queryRunner.run(
      buildUpdateGeneratedCommerceContentQuery(analysisId, commerceContentJson),
    );
    return parseSingleAnalysis(result);
  }

  async getAnalysis(id: number): Promise<AnalysisRecord | null> {
    const result = this.queryRunner.run(buildFindAnalysisByIdQuery(id));

    return parseSingleAnalysis(result);
  }

  async getAnalysisByPhotoId(photoId: number): Promise<AnalysisRecord | null> {
    return (await this.listByPhotoId(photoId))[0] ?? null;
  }

  async listAnalyses(photoId: number): Promise<AnalysisRecord[]> {
    return this.listByPhotoId(photoId);
  }

  async create(input: CreateAnalysisInput): Promise<AnalysisRecord> {
    return this.saveAnalysis(input);
  }

  async findById(id: number): Promise<AnalysisRecord | null> {
    return this.getAnalysis(id);
  }

  async listByPhotoId(photoId: number): Promise<AnalysisRecord[]> {
    const result = this.queryRunner.run(buildListAnalysesByPhotoIdQuery(photoId));

    return parseAnalysisList(result);
  }
}

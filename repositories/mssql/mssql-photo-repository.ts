import type { CreatePhotoInput, PhotoRecord } from "@/lib/types/database";
import type { PhotoRepository } from "@/repositories/photo-repository";
import type { MssqlQueryRunner } from "@/repositories/mssql/mssql-query-runner";
import { LocalMssqlQueryRunner } from "@/repositories/mssql/mssql-query-runner";
import {
  buildDeletePhotoQuery,
  buildFindPhotoByIdQuery,
  buildInsertPhotoQuery,
  buildListPhotosQuery,
} from "@/repositories/mssql/queries/photo-queries";

type JsonPhotoRow = {
  id: number;
  originalName: string;
  filePath: string;
  createdAt: string;
};

function parseSinglePhoto(jsonOutput: string): PhotoRecord | null {
  const trimmed = jsonOutput.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = JSON.parse(trimmed) as JsonPhotoRow;

  return {
    id: parsed.id,
    originalName: parsed.originalName,
    filePath: parsed.filePath,
    createdAt: parsed.createdAt,
  };
}

function parsePhotoList(jsonOutput: string): PhotoRecord[] {
  const trimmed = jsonOutput.trim();

  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed) as JsonPhotoRow[];

  return parsed.map((photo) => ({
    id: photo.id,
    originalName: photo.originalName,
    filePath: photo.filePath,
    createdAt: photo.createdAt,
  }));
}

export class MssqlPhotoRepository implements PhotoRepository {
  constructor(private readonly queryRunner: MssqlQueryRunner = new LocalMssqlQueryRunner()) {}

  async createPhoto(input: CreatePhotoInput): Promise<PhotoRecord> {
    const result = this.queryRunner.run(buildInsertPhotoQuery(input));

    const photo = parseSinglePhoto(result);

    if (!photo) {
      throw new Error("Failed to insert photo metadata.");
    }

    return photo;
  }

  async getPhoto(id: number): Promise<PhotoRecord | null> {
    const result = this.queryRunner.run(buildFindPhotoByIdQuery(id));

    return parseSinglePhoto(result);
  }

  async getPhotoById(id: number): Promise<PhotoRecord | null> {
    return this.getPhoto(id);
  }

  async create(input: CreatePhotoInput): Promise<PhotoRecord> {
    return this.createPhoto(input);
  }

  async findById(id: number): Promise<PhotoRecord | null> {
    return this.getPhoto(id);
  }

  async list(): Promise<PhotoRecord[]> {
    const result = this.queryRunner.run(buildListPhotosQuery());

    return parsePhotoList(result);
  }

  async listPhotos(): Promise<PhotoRecord[]> {
    return this.list();
  }

  async delete(id: number): Promise<boolean> {
    const result = this.queryRunner.run(buildDeletePhotoQuery(id));

    const parsed = JSON.parse(result.trim()) as { deletedCount: number };
    return parsed.deletedCount > 0;
  }
}

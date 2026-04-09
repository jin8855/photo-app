import type Database from "better-sqlite3";

import type { CreatePhotoInput, PhotoRecord } from "@/lib/types/database";
import type { PhotoRepository } from "@/repositories/photo-repository";
import { mapPhotoRow } from "@/repositories/local/sqlite-mappers";

type PhotoRow = {
  id: number;
  original_name: string;
  file_path: string;
  created_at: string;
};

export class SqlitePhotoRepository implements PhotoRepository {
  constructor(private readonly database: Database.Database) {}

  async createPhoto(input: CreatePhotoInput): Promise<PhotoRecord> {
    const statement = this.database.prepare(
      `
        INSERT INTO photos (original_name, file_path)
        VALUES (@originalName, @filePath)
      `,
    );

    const result = statement.run(input);
    const created = await this.findById(Number(result.lastInsertRowid));

    if (!created) {
      throw new Error("Failed to create photo record.");
    }

    return created;
  }

  async getPhoto(id: number): Promise<PhotoRecord | null> {
    const statement = this.database.prepare(
      `
        SELECT id, original_name, file_path, created_at
        FROM photos
        WHERE id = ?
      `,
    );

    const row = statement.get(id) as PhotoRow | undefined;
    return row ? mapPhotoRow(row) : null;
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
    const statement = this.database.prepare(
      `
        SELECT id, original_name, file_path, created_at
        FROM photos
        ORDER BY created_at DESC, id DESC
      `,
    );

    const rows = statement.all() as PhotoRow[];
    return rows.map(mapPhotoRow);
  }

  async listPhotos(): Promise<PhotoRecord[]> {
    return this.list();
  }

  async delete(id: number): Promise<boolean> {
    const statement = this.database.prepare(
      `
        DELETE FROM photos
        WHERE id = ?
      `,
    );

    const result = statement.run(id);
    return result.changes > 0;
  }
}

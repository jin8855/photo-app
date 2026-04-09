import type { CreatePhotoInput, PhotoRecord } from "@/lib/types/database";
import type { PhotoRepository } from "@/repositories/photo-repository";
import { mapPostgresPhotoRow } from "@/repositories/postgres/postgres-mappers";
import { createPostgresQueryClient } from "@/repositories/postgres/postgres-query-client";
import { assertPostgresConfigured } from "@/repositories/postgres/postgres-repository-errors";

type PostgresPhotoRow = {
  id: number | string;
  original_name: string;
  file_path: string;
  created_at: string | Date;
};

export class PostgresPhotoRepository implements PhotoRepository {
  private readonly client = createPostgresQueryClient();

  constructor() {
    assertPostgresConfigured();
  }

  async createPhoto(input: CreatePhotoInput): Promise<PhotoRecord> {
    const rows = await this.client.query<PostgresPhotoRow>(
      `
        insert into public.photos (original_name, file_path)
        values ($1, $2)
        returning id, original_name, file_path, created_at
      `,
      [input.originalName, input.filePath],
    );
    const created = rows[0];

    if (!created) {
      throw new Error("Failed to create photo record.");
    }

    return mapPostgresPhotoRow(created);
  }

  async getPhoto(id: number): Promise<PhotoRecord | null> {
    const rows = await this.client.query<PostgresPhotoRow>(
      `
        select id, original_name, file_path, created_at
        from public.photos
        where id = $1
      `,
      [id],
    );

    return rows[0] ? mapPostgresPhotoRow(rows[0]) : null;
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
    const rows = await this.client.query<PostgresPhotoRow>(
      `
        select id, original_name, file_path, created_at
        from public.photos
        order by created_at desc, id desc
      `,
    );

    return rows.map(mapPostgresPhotoRow);
  }

  async listPhotos(): Promise<PhotoRecord[]> {
    return this.list();
  }

  async delete(id: number): Promise<boolean> {
    const rows = await this.client.query<{ id: number | string }>(
      `
        delete from public.photos
        where id = $1
        returning id
      `,
      [id],
    );

    return rows.length > 0;
  }
}

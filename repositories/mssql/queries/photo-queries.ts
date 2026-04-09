import { toSqlNvarcharLiteral } from "@/lib/db/sql-literal";
import type { CreatePhotoInput } from "@/lib/types/database";

export function buildInsertPhotoQuery(input: CreatePhotoInput): string {
  return `
    SET NOCOUNT ON;
    DECLARE @Inserted TABLE (
      id INT,
      originalName NVARCHAR(255),
      filePath NVARCHAR(500),
      createdAt NVARCHAR(50)
    );

    INSERT INTO dbo.photos (original_name, file_path)
    OUTPUT
      inserted.id,
      inserted.original_name,
      inserted.file_path,
      CONVERT(NVARCHAR(50), inserted.created_at, 126)
    INTO @Inserted
    VALUES (${toSqlNvarcharLiteral(input.originalName)}, ${toSqlNvarcharLiteral(input.filePath)});

    SELECT * FROM @Inserted FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
  `;
}

export function buildFindPhotoByIdQuery(id: number): string {
  return `
    SET NOCOUNT ON;
    SELECT
      id,
      original_name AS originalName,
      file_path AS filePath,
      CONVERT(NVARCHAR(50), created_at, 126) AS createdAt
    FROM dbo.photos
    WHERE id = ${id}
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
  `;
}

export function buildListPhotosQuery(): string {
  return `
    SET NOCOUNT ON;
    SELECT
      id,
      original_name AS originalName,
      file_path AS filePath,
      CONVERT(NVARCHAR(50), created_at, 126) AS createdAt
    FROM dbo.photos
    ORDER BY created_at DESC, id DESC
    FOR JSON PATH;
  `;
}

export function buildDeletePhotoQuery(id: number): string {
  return `
    SET NOCOUNT ON;
    DELETE FROM dbo.photos
    WHERE id = ${id};

    SELECT @@ROWCOUNT AS deletedCount
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
  `;
}

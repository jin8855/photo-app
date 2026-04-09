import { runSqlCommand } from "@/lib/db/sqlcmd";
import { getLocalMssqlConfig } from "@/resources/config/database";

function escapeIdentifier(value: string): string {
  return value.replace(/]/g, "]]");
}

export function ensurePhotosTableReady(): void {
  const config = getLocalMssqlConfig();
  const databaseName = escapeIdentifier(config.databaseName);

  runSqlCommand({
    server: config.server,
    database: "master",
    query: `
      IF DB_ID(N'${config.databaseName.replace(/'/g, "''")}') IS NULL
      BEGIN
        CREATE DATABASE [${databaseName}]
      END
    `,
  });

  runSqlCommand({
    server: config.server,
    database: config.databaseName,
    query: `
      IF OBJECT_ID(N'dbo.photos', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.photos (
          id INT IDENTITY(1,1) PRIMARY KEY,
          original_name NVARCHAR(255) NOT NULL,
          file_path NVARCHAR(500) NOT NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_photos_created_at DEFAULT SYSUTCDATETIME()
        )
      END
    `,
  });
}

export function ensureAnalysesTableReady(): void {
  const config = getLocalMssqlConfig();

  runSqlCommand({
    server: config.server,
    database: config.databaseName,
    query: `
      IF OBJECT_ID(N'dbo.analyses', N'U') IS NULL
      BEGIN
        CREATE TABLE dbo.analyses (
          id INT IDENTITY(1,1) PRIMARY KEY,
          photo_id INT NOT NULL,
          scene_type NVARCHAR(100) NOT NULL,
          mood_category NVARCHAR(100) NOT NULL,
          short_review NVARCHAR(500) NOT NULL,
          long_review NVARCHAR(MAX) NOT NULL,
          recommended_text_position NVARCHAR(100) NOT NULL,
          wallpaper_score INT NOT NULL,
          social_score INT NOT NULL,
          commercial_score INT NOT NULL,
          phrases_json NVARCHAR(MAX) NOT NULL,
          captions_json NVARCHAR(MAX) NOT NULL,
          hashtags_json NVARCHAR(MAX) NOT NULL,
          generation_source NVARCHAR(50) NOT NULL CONSTRAINT DF_analyses_generation_source DEFAULT N'mock',
          generation_warning NVARCHAR(500) NULL,
          content_set_json NVARCHAR(MAX) NULL,
          commerce_content_json NVARCHAR(MAX) NULL,
          created_at DATETIME2 NOT NULL CONSTRAINT DF_analyses_created_at DEFAULT SYSUTCDATETIME(),
          CONSTRAINT FK_analyses_photo_id FOREIGN KEY (photo_id) REFERENCES dbo.photos(id) ON DELETE CASCADE
        );

        CREATE INDEX IX_analyses_photo_id ON dbo.analyses(photo_id);
        CREATE INDEX IX_analyses_created_at ON dbo.analyses(created_at DESC);
      END
    `,
  });

  runSqlCommand({
    server: config.server,
    database: config.databaseName,
    query: `
      IF COL_LENGTH(N'dbo.analyses', N'generation_source') IS NULL
      BEGIN
        ALTER TABLE dbo.analyses
        ADD generation_source NVARCHAR(50) NOT NULL CONSTRAINT DF_analyses_generation_source DEFAULT N'mock'
      END;

      IF COL_LENGTH(N'dbo.analyses', N'generation_warning') IS NULL
      BEGIN
        ALTER TABLE dbo.analyses
        ADD generation_warning NVARCHAR(500) NULL
      END;

      IF COL_LENGTH(N'dbo.analyses', N'content_set_json') IS NULL
      BEGIN
        ALTER TABLE dbo.analyses
        ADD content_set_json NVARCHAR(MAX) NULL
      END;

      IF COL_LENGTH(N'dbo.analyses', N'commerce_content_json') IS NULL
      BEGIN
        ALTER TABLE dbo.analyses
        ADD commerce_content_json NVARCHAR(MAX) NULL
      END;
    `,
  });
}

# Postgres repository implementation

This folder contains the Postgres repository implementation while MSSQL remains the active default runtime.

Current state:

- `PostgresPhotoRepository`
- `PostgresAnalysisRepository`
- `PostgresHistoryRepository`
- `createPostgresQueryClient()`

They are wired into the provider selection flow and are intended to run when `DB_PROVIDER=postgres`.

Implementation checklist:

1. Read `POSTGRES_URL` from config.
2. Validate the repositories against a live Postgres or Supabase database.
3. Confirm upload, analysis, history, and persistence flows.
4. Keep row shaping in TypeScript instead of MSSQL-style JSON SQL output.
5. Keep service and UI layers unchanged.

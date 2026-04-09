# Current DB strategy

This document defines the current database direction for the project and clarifies which code paths are official, legacy, or future-facing.

## 1. Current official DB path

The current official runtime database path is:

- `DB_PROVIDER=mssql`
- runtime config: [app-runtime.ts](C:\EtcProject\photo-caption-local-app\resources\config\app-runtime.ts)
- repository selection: [repository-factory.ts](C:\EtcProject\photo-caption-local-app\repositories\repository-factory.ts)
- runtime bootstrap: [database-bootstrap.ts](C:\EtcProject\photo-caption-local-app\db\database-bootstrap.ts)
- MSSQL adapter: [mssql-repository-adapter.ts](C:\EtcProject\photo-caption-local-app\repositories\adapters\mssql\mssql-repository-adapter.ts)

In the current app:

- UI does not talk to MSSQL directly.
- API routes do not run MSSQL queries directly.
- services use repository interfaces.
- MSSQL-specific behavior is concentrated in `repositories/mssql` and `db/mssql`.

This is the only official application database path that should be considered production-ready today.

## 2. Legacy and test-only DB code

There is still SQLite-related code in the repository:

- [sqlite-repository-adapter.ts](C:\EtcProject\photo-caption-local-app\repositories\adapters\sqlite\sqlite-repository-adapter.ts)
- [local/](C:\EtcProject\photo-caption-local-app\repositories\local)
- local DB client helpers under `lib/db`

Current position:

- SQLite is **not** part of the official runtime provider selection.
- `DB_PROVIDER` currently supports only:
  - `mssql`
  - `postgres`
- SQLite remains as:
  - legacy support
  - test or migration reference code
  - fallback implementation material during refactoring

Rule:

- do not treat SQLite as the external deployment target
- do not add new product features only to the SQLite path
- if a repository interface changes, SQLite may be kept compiling, but it is not the strategic deployment path

## 3. Target DB path for external deployment

The target external deployment database path is:

- `DB_PROVIDER=postgres`
- file storage target:
  - `STORAGE_PROVIDER=supabase-storage`

Target architecture:

- database: Postgres, likely Supabase Postgres
- file storage: Supabase Storage
- app code:
  - UI unchanged
  - services unchanged
  - repository and storage providers switched by env

Recommended rollout order:

1. keep MSSQL as the active DB
2. move file storage first to Supabase Storage
3. implement Postgres repositories
4. validate history, upload, and analysis persistence
5. switch `DB_PROVIDER` from `mssql` to `postgres`

## 4. Provider implementation status

### MSSQL

Status: `active`, `implemented`

What exists:

- runtime selection
- bootstrap
- repository adapter
- photo repository
- analysis repository
- history repository
- saved generated content persistence

Notes:

- this is the current source of truth for runtime behavior
- query execution still depends on SQL Server-specific tooling and syntax

### Postgres

Status: `implemented`, `not yet live-validated`

What exists:

- runtime selection via `DB_PROVIDER=postgres`
- bootstrap placeholder
- repository adapter
- Postgres client layer
- real photo repository implementation
- real analysis repository implementation
- real history repository implementation
- row mapping and query logic
- schema draft
- migration notes

What is still missing:

- live validation against the target Postgres or Supabase environment
- production migration execution
- deployment-time operational verification

Reference:

- [postgres-repository-adapter.ts](C:\EtcProject\photo-caption-local-app\repositories\adapters\postgres\postgres-repository-adapter.ts)
- [README.md](C:\EtcProject\photo-caption-local-app\repositories\postgres\README.md)

### SQLite

Status: `legacy`, `support-only`

What exists:

- repository adapter
- repository implementations
- schema files

What it means:

- useful for compatibility and reference
- not the forward deployment strategy
- should not drive architecture decisions from this point onward

## 5. Current coupling and migration risk

The project is already separated at the UI and service levels, but the current data layer still has real MSSQL coupling in these areas:

- query execution strategy
- SQL Server query syntax
- history query shape
- bootstrap behavior

Main coupling points:

- [sqlcmd.ts](C:\EtcProject\photo-caption-local-app\lib\db\sqlcmd.ts)
- [mssql-query-runner.ts](C:\EtcProject\photo-caption-local-app\repositories\mssql\mssql-query-runner.ts)
- [queries/](C:\EtcProject\photo-caption-local-app\repositories\mssql\queries)

This means:

- services are already mostly provider-agnostic
- repositories are not yet provider-agnostic internally
- the actual migration work is mainly in repository execution and query rewriting

## 6. Next transition work scope

The next transition work should be limited to these areas.

### Required for Postgres readiness

1. validate the Postgres path against a live Postgres or Supabase database
2. confirm upload, analysis save, history list, and history detail behavior
3. move deployment runtime from MSSQL to Postgres when validation is complete
4. keep history shaping in TypeScript row mapping and avoid MSSQL-only JSON SQL output

### Required for external deployment stability

1. keep MSSQL as default for now
2. use Supabase Storage for uploaded files
3. preserve DB metadata-only storage for files
4. confirm generated content persistence works in history detail

### Not required immediately

These can wait until after the initial external deployment:

- remove SQLite code entirely
- fully remove MSSQL bootstrap runtime path
- add auth-based user partitioning
- add Supabase RLS policies

## 7. Current decision summary

Use this as the current project rule:

- official DB today: `MSSQL`
- official external target DB: `Postgres`
- official external target storage: `Supabase Storage`
- SQLite: compatibility or legacy only
- UI and services must stay provider-agnostic
- new migration work should focus on repositories and storage adapters, not on UI rewrites

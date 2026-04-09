# Local DB Notes

- Local database engine: SQLite via `better-sqlite3`
- Default database file: `db/local/photo-caption.db`
- Schema source: `db/schema.sql`
- Initialization entry: `db/init.ts`
- Sample seed entry: `db/seed.ts`

Run locally:

- `npm.cmd run db:init`
- `npm.cmd run db:seed`

Architecture:

- `lib/db`: connection and path config
- `repositories`: database access abstraction and SQLite implementation
- `services`: orchestration layer above repositories

This separation keeps later migration to PostgreSQL or another external database lower risk.

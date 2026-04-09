# Photo Caption Local App

Generate emotional photo reviews, short phrases, captions, reusable content sets, and commerce-ready copy from a single uploaded image.

## Runtime strategy

Current supported runtime defaults:

- `DB_PROVIDER=mssql`
- `STORAGE_PROVIDER=local-public`

Prepared external deployment path:

- `DB_PROVIDER=postgres`
- `STORAGE_PROVIDER=supabase-storage`

UI and service layers are provider-agnostic. Database and file storage are selected through environment variables.

## Requirements

- Node.js 22 or later recommended
- npm 10 or later recommended
- Windows + LocalDB for the default MSSQL local path
  - or a real SQL Server connection string

## Quick start

1. Install dependencies

```powershell
npm.cmd ci
```

2. Create your local env file

```powershell
Copy-Item .env.example .env.local
```

3. Pick a runtime path

Local Windows default:

- `DB_PROVIDER=mssql`
- `STORAGE_PROVIDER=local-public`
- keep `LOCAL_SQLSERVER_INSTANCE=(localdb)\MSSQLLocalDB`

External-ready path:

- `DB_PROVIDER=postgres`
- `POSTGRES_URL=...`
- `STORAGE_PROVIDER=supabase-storage`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SUPABASE_STORAGE_BUCKET=...`

4. Verify and build

```powershell
npm.cmd run typecheck
npm.cmd run build
```

5. Run the app

```powershell
npm.cmd run dev
```

## Provider settings

### DB_PROVIDER

- `mssql`
  - current official local runtime
  - requires `MSSQL_CONNECTION_STRING` or `LOCAL_SQLSERVER_INSTANCE`
- `postgres`
  - external deployment target
  - requires `POSTGRES_URL`

### STORAGE_PROVIDER

- `local-public`
  - current default local file storage
- `supabase-storage`
  - external deployment target
  - requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`

## Validation and setup commands

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run ai:verify
npm.cmd run storage:verify
```

Optional live storage verification:

```powershell
npm.cmd run storage:verify -- --live
```

Database bootstrap and seed:

```powershell
npm.cmd run db:init
npm.cmd run db:seed
```

## Development vs deployment

### Development

- default path is `mssql + local-public`
- easiest on a Windows PC with LocalDB
- no auth required
- generated files stay local

### Deployment target

- recommended path is `postgres + supabase-storage`
- better fit for multi-user browser access
- avoids local file persistence risk
- keeps DB and object storage separate

## Common failure checks

### App fails at startup

Check missing runtime env values:

- `DB_PROVIDER=mssql`
  - needs `MSSQL_CONNECTION_STRING` or `LOCAL_SQLSERVER_INSTANCE`
- `DB_PROVIDER=postgres`
  - needs `POSTGRES_URL`
- `STORAGE_PROVIDER=supabase-storage`
  - needs `SUPABASE_URL`
  - needs `SUPABASE_SERVICE_ROLE_KEY`
  - needs `SUPABASE_STORAGE_BUCKET`

### Typecheck or build fails

Run:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run build
```

If `.next` or `tsbuildinfo` was removed, the project should still rebuild cleanly.

### Uploaded image preview fails

Check:

- the selected storage provider
- the stored file path
- Supabase bucket visibility or URL config

## Additional docs

- [Current DB strategy](C:\EtcProject\photo-caption-local-app\docs\db\current-db-strategy.md)
- [MSSQL to Postgres migration guide](C:\EtcProject\photo-caption-local-app\docs\db\mssql-to-postgres-supabase-guide.md)
- [Postgres live validation checklist](C:\EtcProject\photo-caption-local-app\docs\db\postgres-live-validation-checklist.md)
- [Deployment setup guide](C:\EtcProject\photo-caption-local-app\docs\deploy\deployment-setup.md)
- [Supabase storage rollout](C:\EtcProject\photo-caption-local-app\docs\deploy\supabase-storage-rollout.md)

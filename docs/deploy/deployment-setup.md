# Deployment setup guide

This document describes the current deployment-ready configuration for the project.

## 1. Current official baseline

The current stable baseline is:

- `DB_PROVIDER=mssql`
- `STORAGE_PROVIDER=local-public`

This is the easiest path for local development on Windows.

## 2. Recommended external deployment target

For external deployment, the target direction is:

- `DB_PROVIDER=postgres`
- `STORAGE_PROVIDER=supabase-storage`

This keeps the app structure unchanged while swapping provider implementations.

## 3. Environment variables

### Required for all environments

- `DB_PROVIDER`
- `STORAGE_PROVIDER`
- `ANALYSIS_PROVIDER`

### Required for MSSQL

- `MSSQL_CONNECTION_STRING`
  - or
- `LOCAL_SQLSERVER_INSTANCE`

### Required for Postgres

- `POSTGRES_URL`

### Required for Supabase Storage

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## 4. Initial setup order

1. install dependencies
2. copy `.env.example` to `.env.local`
3. choose `DB_PROVIDER`
4. choose `STORAGE_PROVIDER`
5. fill the required provider-specific env values
6. run `npm.cmd run typecheck`
7. run `npm.cmd run build`
8. run `npm.cmd run storage:verify`
9. start the app with `npm.cmd run dev`

## 5. Deployment environment notes

### If keeping MSSQL temporarily

- avoid LocalDB assumptions in deployment
- use `MSSQL_CONNECTION_STRING`
- ensure the runtime host can access SQL Server

### If using Postgres

- provide `POSTGRES_URL`
- ensure schema is created before traffic is routed

### If using Supabase Storage

- create the storage bucket first
- confirm public preview strategy or signed URL strategy
- keep DB writes limited to file metadata only

## 6. Checkpoints before sharing the project

- `npm.cmd ci` succeeds
- `npm.cmd run typecheck` succeeds
- `npm.cmd run build` succeeds
- runtime starts with the chosen provider env values
- one image can be uploaded and previewed
- one analysis can be saved and reopened from history

## 7. Troubleshooting checklist

### Missing config

Errors beginning with `configMissing:` mean the runtime provider selection and env values do not match.

Examples:

- `configMissing:MSSQL_CONNECTION_STRING|LOCAL_SQLSERVER_INSTANCE`
- `configMissing:POSTGRES_URL`
- `configMissing:SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_STORAGE_BUCKET`

### Storage issues

If uploads fail:

- verify `STORAGE_PROVIDER`
- verify Supabase credentials
- verify bucket name
- run `npm.cmd run storage:verify -- --live`

### Build issues

If build fails in a clean environment:

- re-run `npm.cmd ci`
- re-run `npm.cmd run typecheck`
- re-run `npm.cmd run build`
- confirm that no local-only generated files are required

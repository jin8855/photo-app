# Postgres live validation checklist

This checklist is for the first real validation run with:

- `DB_PROVIDER=postgres`
- `POSTGRES_URL=...`

The goal is to confirm that the Postgres provider is not only implemented, but also operational in a live environment.

## 1. Before the validation run

- confirm Postgres schema is created
- confirm `POSTGRES_URL` is valid
- confirm `STORAGE_PROVIDER` is intentionally selected
  - `local-public` for local validation
  - or `supabase-storage` for deployment-like validation
- confirm `.env.local` matches the chosen provider path

## 2. Build-time validation

Run:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Both commands must pass before live validation starts.

## 3. Smoke test flow

### Upload

- start the app
- upload one image
- confirm the upload succeeds
- confirm the photo record exists in Postgres

Check:

- `photos.original_name`
- `photos.file_path`
- `photos.created_at`

### Analyze

- run analysis for the uploaded photo
- confirm analysis succeeds
- confirm the analysis record exists in Postgres

Check:

- `analyses.photo_id`
- `analyses.scene_type`
- `analyses.mood_category`
- `analyses.phrases_json`
- `analyses.captions_json`
- `analyses.hashtags_json`
- `analyses.generation_source`

### History list

- open `/history`
- confirm the new record appears
- confirm sorting and preview look correct

### History detail

- open the photo detail page
- confirm the analysis data is restored

### Generated content persistence

- create one content set
- create one commerce payload
- refresh the page
- confirm both values are restored from Postgres-backed history detail

Check:

- `analyses.generated_content_set_json`
- `analyses.generated_commerce_content_json`

## 4. Data integrity checks

- uploaded photo exists before analysis insert
- `analyses.photo_id` resolves to a valid `photos.id`
- `phrases_json` parses correctly
- `captions_json` parses correctly
- `hashtags_json` parses correctly
- generated content JSON parses correctly after refresh

## 5. Failure tracing

During validation, inspect server logs for:

- `api.photos.upload.failed`
- `api.photos.analyze.failed`
- `api.contentSet.failed`
- `api.commerce.failed`
- `api.photos.delete.failed`

Each failing request should include:

- `requestId`
- `event`
- `route`
- structured error payload

## 6. Exit criteria

The Postgres path is ready for deployment testing only if all of these pass:

- build passes
- upload passes
- analysis passes
- history list passes
- history detail passes
- content set persistence passes
- commerce persistence passes
- no orphan analysis rows are created

## 7. If validation fails

- keep `DB_PROVIDER=mssql`
- fix the failing Postgres repository path
- rerun this checklist from build validation onward

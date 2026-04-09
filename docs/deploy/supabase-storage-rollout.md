# Supabase Storage rollout

This project currently keeps the default runtime on:

- `DB_PROVIDER=mssql`
- `STORAGE_PROVIDER=local-public`

Future external deployment can switch file storage to Supabase Storage without changing UI or service contracts.

## Required env

- `STORAGE_PROVIDER=supabase-storage`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## Verification

Config-only check:

```powershell
npm.cmd run storage:verify
```

Live upload/delete check:

```powershell
npm.cmd run storage:verify -- --live
```

## Rollout order

1. Create a public or signed-URL-ready storage bucket.
2. Add the required env values.
3. Run the config-only verification command.
4. Run the live verification command.
5. Switch `STORAGE_PROVIDER` to `supabase-storage`.
6. Upload one image in the app and confirm:
   - preview works
   - DB stores only file path metadata
   - delete removes the object from storage

## Notes

- The database still stores metadata only.
- UI and service layers do not need provider-specific changes.
- If rollout fails, switch `STORAGE_PROVIDER` back to `local-public`.

# Supabase Storage adapter

This folder contains the Supabase Storage adapter for external file storage rollout.

Current state:

- `SupabasePhotoStorage` is implemented.
- `createSupabaseStorageAdapter()` is already wired into storage provider selection.
- runtime env validation is already in place.

Implementation checklist:

1. Set `STORAGE_PROVIDER=supabase-storage`.
2. Provide `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.
3. Ensure the selected bucket allows the intended public preview strategy.
4. Keep DB writes limited to metadata only.
5. Keep UI and service layers storage-provider agnostic.

export function getSupabaseConfig() {
  const normalize = (value: string | undefined) =>
    (value ?? "").replace(/\\r/g, "").replace(/\\n/g, "").trim();

  return {
    url: normalize(process.env.SUPABASE_URL),
    anonKey: normalize(process.env.SUPABASE_ANON_KEY),
    serviceRoleKey: normalize(process.env.SUPABASE_SERVICE_ROLE_KEY),
    storageBucket: normalize(process.env.SUPABASE_STORAGE_BUCKET),
  };
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/resources/config/database";

type StoragePublicUrlResult = {
  data: {
    publicUrl: string;
  };
};

export type SupabaseStorageClient = {
  bucket: string;
  client: SupabaseClient;
  getPublicUrl: (path: string) => string;
};

export function createSupabaseStorageClient(): SupabaseStorageClient {
  const config = getSupabaseConfig();

  if (!config.url || !config.serviceRoleKey || !config.storageBucket) {
    throw new Error("supabaseStorageNotConfigured");
  }

  const client = createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return {
    bucket: config.storageBucket,
    client,
    getPublicUrl(path: string): string {
      const result = client.storage.from(config.storageBucket).getPublicUrl(path) as StoragePublicUrlResult;
      return result.data.publicUrl;
    },
  };
}

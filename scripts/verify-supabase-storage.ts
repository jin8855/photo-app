import { getSupabaseConfig } from "@/resources/config/database";
import { createSupabaseStorageClient } from "@/services/storage/adapters/supabase/supabase-storage-client";

const liveMode = process.argv.includes("--live");

function isPresent(value: string): boolean {
  return Boolean(value && value.trim());
}

async function runLiveCheck(): Promise<{
  attempted: boolean;
  success: boolean;
  bucket?: string;
  uploadedPath?: string;
  error?: string;
}> {
  const config = getSupabaseConfig();

  if (!isPresent(config.url) || !isPresent(config.serviceRoleKey) || !isPresent(config.storageBucket)) {
    return {
      attempted: true,
      success: false,
      error: "missingSupabaseStorageConfig",
    };
  }

  try {
    const storage = createSupabaseStorageClient();
    const uploadedPath = `codex-verify/${Date.now()}-storage-check.txt`;
    const payload = Buffer.from("supabase-storage-check", "utf8");

    const uploadResult = await storage.client.storage.from(storage.bucket).upload(uploadedPath, payload, {
      contentType: "text/plain; charset=utf-8",
      upsert: false,
    });

    if (uploadResult.error) {
      return {
        attempted: true,
        success: false,
        bucket: storage.bucket,
        error: `uploadFailed:${uploadResult.error.message}`,
      };
    }

    const removeResult = await storage.client.storage.from(storage.bucket).remove([uploadedPath]);

    if (removeResult.error) {
      return {
        attempted: true,
        success: false,
        bucket: storage.bucket,
        uploadedPath,
        error: `deleteFailed:${removeResult.error.message}`,
      };
    }

    return {
      attempted: true,
      success: true,
      bucket: storage.bucket,
      uploadedPath,
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      error: error instanceof Error ? error.message : "unknownStorageError",
    };
  }
}

async function main(): Promise<void> {
  const config = getSupabaseConfig();
  const configuredStorageProvider =
    process.env.STORAGE_PROVIDER === "local-public" || process.env.STORAGE_PROVIDER === "supabase-storage"
      ? process.env.STORAGE_PROVIDER
      : undefined;
  const storageProvider = configuredStorageProvider ?? "local-public";

  const summary = {
    storageProvider,
    supabaseConfigured: {
      url: isPresent(config.url),
      anonKey: isPresent(config.anonKey),
      serviceRoleKey: isPresent(config.serviceRoleKey),
      storageBucket: isPresent(config.storageBucket),
    },
    mode: storageProvider === "supabase-storage" ? "supabase-active" : "local-default-active",
    liveCheck: liveMode
      ? await runLiveCheck()
      : {
          attempted: false,
          success: false,
        },
  };

  console.log(JSON.stringify(summary, null, 2));
}

main();

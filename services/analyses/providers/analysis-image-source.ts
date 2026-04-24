import fs from "node:fs/promises";
import path from "node:path";

import { AppError } from "@/lib/errors/app-error";
import { getAppRuntimeConfig } from "@/resources/config/app-runtime";
import { createSupabaseStorageClient } from "@/services/storage/adapters/supabase/supabase-storage-client";

export type AnalysisImageReference = {
  kind: "url" | "data";
  value: string;
};

function toMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  if (extension === ".gif") {
    return "image/gif";
  }

  return "image/jpeg";
}

function normalizeLocalPublicPath(filePath: string): string {
  const normalized = filePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", normalized);
  const publicRoot = path.join(process.cwd(), "public");

  if (!absolutePath.startsWith(publicRoot)) {
    throw new AppError({
      code: "analyzeFailed",
      status: 400,
      message: "Analysis image path is invalid.",
      details: { filePath },
    });
  }

  return absolutePath;
}

export async function resolveAnalysisImageReference(
  filePath: string,
): Promise<AnalysisImageReference> {
  if (/^https?:\/\//i.test(filePath)) {
    return {
      kind: "url",
      value: filePath,
    };
  }

  const runtime = getAppRuntimeConfig();

  if (runtime.storageProvider === "supabase-storage") {
    const storage = createSupabaseStorageClient();

    return {
      kind: "url",
      value: storage.getPublicUrl(filePath.replace(/^\/+/, "")),
    };
  }

  const absolutePath = normalizeLocalPublicPath(filePath);
  const buffer = await fs.readFile(absolutePath);
  const mimeType = toMimeType(absolutePath);

  return {
    kind: "data",
    value: `data:${mimeType};base64,${buffer.toString("base64")}`,
  };
}

import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import type { PhotoStyleType } from "@/lib/types/analysis";
import { getAppRuntimeConfig } from "@/resources/config/app-runtime";
import { createSupabaseStorageClient } from "@/services/storage/adapters/supabase/supabase-storage-client";

type PixelStats = {
  motionScore: number;
  smokeRatio: number;
  darkRoadRatio: number;
  vividAccentRatio: number;
  greenNatureRatio: number;
  brightFogRatio: number;
};

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max === 0) {
    return 0;
  }

  return ((max - min) / max) * 255;
}

async function readImageBuffer(filePath: string): Promise<Buffer> {
  if (/^https?:\/\//i.test(filePath)) {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`imageFetchFailed:${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  if (path.isAbsolute(filePath)) {
    return fs.readFile(filePath);
  }

  const runtime = getAppRuntimeConfig();

  if (runtime.storageProvider === "supabase-storage") {
    const storage = createSupabaseStorageClient();
    const publicUrl = storage.getPublicUrl(filePath.replace(/^\/+/, ""));
    const response = await fetch(publicUrl);

    if (!response.ok) {
      throw new Error(`imageFetchFailed:${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  const normalized = filePath.replace(/^\/+/, "");
  const absolutePath = path.join(process.cwd(), "public", normalized);
  return fs.readFile(absolutePath);
}

async function extractPixelStats(filePath: string): Promise<PixelStats> {
  const buffer = await readImageBuffer(filePath);
  const { data, info } = await sharp(buffer)
    .resize(48, 48, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let smokePixels = 0;
  let darkRoadPixels = 0;
  let vividAccentPixels = 0;
  let greenNaturePixels = 0;
  let brightFogPixels = 0;
  let horizontalEnergy = 0;
  let verticalEnergy = 0;

  const width = info.width;
  const height = info.height;
  const pixelCount = width * height;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 3;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const lum = luminance(r, g, b);
      const sat = saturation(r, g, b);

      if (lum > 165 && sat < 42) {
        smokePixels += 1;
      }

      if (y > height * 0.48 && lum < 85 && sat < 70) {
        darkRoadPixels += 1;
      }

      if (sat > 120 && (r > 120 || g > 120 || b > 120)) {
        vividAccentPixels += 1;
      }

      if (g > r + 12 && g > b + 12 && sat > 40) {
        greenNaturePixels += 1;
      }

      if (lum > 150 && sat < 28) {
        brightFogPixels += 1;
      }

      if (x + 1 < width) {
        const rightIndex = index + 3;
        horizontalEnergy +=
          Math.abs(r - data[rightIndex]) +
          Math.abs(g - data[rightIndex + 1]) +
          Math.abs(b - data[rightIndex + 2]);
      }

      if (y + 1 < height) {
        const downIndex = index + width * 3;
        verticalEnergy +=
          Math.abs(r - data[downIndex]) +
          Math.abs(g - data[downIndex + 1]) +
          Math.abs(b - data[downIndex + 2]);
      }
    }
  }

  return {
    motionScore: (horizontalEnergy + verticalEnergy) / pixelCount,
    smokeRatio: smokePixels / pixelCount,
    darkRoadRatio: darkRoadPixels / pixelCount,
    vividAccentRatio: vividAccentPixels / pixelCount,
    greenNatureRatio: greenNaturePixels / pixelCount,
    brightFogRatio: brightFogPixels / pixelCount,
  };
}

export async function resolveMockVisualPhotoStyleType(
  filePath: string,
): Promise<PhotoStyleType | null> {
  try {
    const stats = await extractPixelStats(filePath);

    const actionSignal =
      stats.smokeRatio > 0.14 &&
      stats.darkRoadRatio > 0.22 &&
      stats.vividAccentRatio > 0.035 &&
      stats.motionScore > 70;

    if (actionSignal) {
      return "action_speed";
    }

    const fogSignal =
      stats.brightFogRatio > 0.24 &&
      stats.greenNatureRatio < 0.22 &&
      stats.vividAccentRatio < 0.04;

    if (fogSignal) {
      return "reflective_fog";
    }

    const naturalSignal =
      stats.greenNatureRatio > 0.22 &&
      stats.smokeRatio < 0.12 &&
      stats.darkRoadRatio < 0.18;

    if (naturalSignal) {
      return "natural_healing";
    }

    return null;
  } catch {
    return null;
  }
}

import type { InstagramOutputAspectRatio } from "@/lib/types/content";

export const DEFAULT_INSTAGRAM_ASPECT_RATIO: InstagramOutputAspectRatio = "4:5";

export const INSTAGRAM_OUTPUT_FORMATS = {
  "1:1": {
    width: 1080,
    height: 1080,
    cssAspectRatio: "1 / 1",
  },
  "4:5": {
    width: 1080,
    height: 1350,
    cssAspectRatio: "4 / 5",
  },
  "9:16": {
    width: 1080,
    height: 1920,
    cssAspectRatio: "9 / 16",
  },
} as const satisfies Record<
  InstagramOutputAspectRatio,
  {
    width: number;
    height: number;
    cssAspectRatio: string;
  }
>;

export function resolveInstagramOutputFormat(aspectRatio?: InstagramOutputAspectRatio) {
  return INSTAGRAM_OUTPUT_FORMATS[aspectRatio ?? DEFAULT_INSTAGRAM_ASPECT_RATIO];
}

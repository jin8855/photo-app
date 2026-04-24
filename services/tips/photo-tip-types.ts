import type { PhotoStyleType } from "@/lib/types/analysis";

export type PhotoTipCategory = "composition" | "lighting" | "color" | "retake" | "device";

export type PhotoTipDeviceType =
  | "galaxy_s25_ultra"
  | "galaxy_s26_ultra"
  | "generic_smartphone";

export type PhotoVisualMetrics = {
  brightness?: number;
  contrast?: number;
  saturation?: number;
};

export type PhotoTipInput = {
  sceneType: string;
  moodCategory: string;
  photoStyleType: PhotoStyleType;
  wallpaperScore?: number;
  socialScore?: number;
  commercialScore?: number;
  visualMetrics?: PhotoVisualMetrics;
  deviceType?: PhotoTipDeviceType | null;
};

export type PhotoTip = {
  category: PhotoTipCategory;
  title: string;
  short: string;
  detail?: string;
  why?: string;
  when?: string;
  example?: string;
  relatedSettingHint?: string;
  deviceHint?: string;
  tooltipKey?: string;
};

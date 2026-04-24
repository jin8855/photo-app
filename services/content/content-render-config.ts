import type {
  CameraStyle,
  ContentFocusArea,
  ContentFrameStyle,
  ContentImageFitMode,
  ContentOverlayStyle,
} from "@/lib/types/content";

export type RenderToneStyle = "none" | "bw" | "film";
export type RenderFocusStyle = "none" | "center" | "manual";

export type RenderConfig = {
  toneStyle: RenderToneStyle;
  cameraStyle: CameraStyle;
  focusStyle: RenderFocusStyle;
  focusColorMode: ContentOverlayStyle["focusColorMode"];
  focusArea: ContentFocusArea;
  frameStyle: ContentFrameStyle;
  imageFitMode: ContentImageFitMode;
  params: FilterParams;
};

export type FilterParams = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sharpness: number;
  grain: number;
  fade: number;
  vignette: number;
  blurBackground: number;
};

const CAMERA_STYLE_INTERNAL = {
  natural: "iphone-like",
  warmPortrait: "canon-like",
  crisp: "sony-like",
  classic: "nikon-like",
} as const satisfies Record<Exclude<CameraStyle, "none">, string>;

export const DEFAULT_FOCUS_AREA: ContentFocusArea = {
  centerX: 0.5,
  centerY: 0.45,
  radius: 0.31,
};

export function buildRenderConfig(style: ContentOverlayStyle): RenderConfig {
  const toneStyle = resolveToneStyle(style.imageFilter);
  const cameraStyle = style.cameraStyle ?? "none";
  const focusStyle = style.focusStyle ?? (style.imageFilter === "portrait_focus" ? "center" : "none");
  const focusColorMode = style.focusColorMode ?? "none";
  const focusArea = focusStyle === "center" ? DEFAULT_FOCUS_AREA : sanitizeFocusArea(style.focusArea);
  const frameStyle = style.frameStyle ?? "none";
  const imageFitMode = style.imageFitMode ?? "contain";

  return {
    toneStyle,
    cameraStyle,
    focusStyle,
    focusColorMode,
    focusArea,
    frameStyle,
    imageFitMode,
    params: mergeRenderParams(
      resolveToneParams(toneStyle),
      resolveCameraParams(cameraStyle, toneStyle),
      resolveFocusParams(focusStyle, toneStyle),
    ),
  };
}

function sanitizeFocusArea(value: ContentFocusArea | undefined): ContentFocusArea {
  if (!value) {
    return DEFAULT_FOCUS_AREA;
  }

  return {
    centerX: clamp(value.centerX, 0, 1),
    centerY: clamp(value.centerY, 0, 1),
    radius: clamp(value.radius, 0.15, 0.5),
  };
}

function resolveToneStyle(imageFilter: ContentOverlayStyle["imageFilter"]): RenderToneStyle {
  if (imageFilter === "black_and_white") {
    return "bw";
  }

  if (imageFilter === "film_frame" || imageFilter === "travel_film" || imageFilter === "vintage_cream") {
    return "film";
  }

  return "none";
}

function resolveToneParams(toneStyle: RenderToneStyle): FilterParams {
  if (toneStyle === "bw") {
    return {
      brightness: 1,
      contrast: 1.08,
      saturation: 0,
      temperature: 0,
      sharpness: 0,
      grain: 0,
      fade: 0,
      vignette: 0.06,
      blurBackground: 0,
    };
  }

  if (toneStyle === "film") {
    return {
      brightness: 1.01,
      contrast: 0.96,
      saturation: 0.9,
      temperature: 6,
      sharpness: -2,
      grain: 8,
      fade: 8,
      vignette: 0.08,
      blurBackground: 0,
    };
  }

  return {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    temperature: 0,
    sharpness: 0,
    grain: 0,
    fade: 0,
    vignette: 0,
    blurBackground: 0,
  };
}

function resolveCameraParams(cameraStyle: CameraStyle, toneStyle: RenderToneStyle): Partial<FilterParams> {
  if (cameraStyle === "none") {
    return {};
  }

  if (toneStyle === "bw") {
    if (cameraStyle === "crisp") {
      return { brightness: 1.01, contrast: 1.12, sharpness: 12 };
    }

    if (cameraStyle === "warmPortrait") {
      return { brightness: 1.02, contrast: 0.94, sharpness: -2 };
    }

    if (cameraStyle === "classic") {
      return { brightness: 1, contrast: 0.9, sharpness: -1 };
    }

    return { brightness: 1, contrast: 1, sharpness: 0 };
  }

  if (toneStyle === "film") {
    if (cameraStyle === "crisp") {
      return { brightness: 1.01, contrast: 1.1, saturation: 1.04, temperature: 0, sharpness: 8 };
    }

    if (cameraStyle === "classic") {
      return { brightness: 1, contrast: 0.92, saturation: 0.9, temperature: -2, sharpness: -1 };
    }

    if (cameraStyle === "warmPortrait") {
      return { brightness: 1.02, contrast: 0.95, saturation: 1.07, temperature: 6, sharpness: -2 };
    }

    return { brightness: 1, contrast: 1, saturation: 1, temperature: 0, sharpness: 0 };
  }

  if (cameraStyle === "natural") {
    return { brightness: 1, contrast: 1, saturation: 1, temperature: 0, sharpness: 0 };
  }

  if (cameraStyle === "warmPortrait") {
    return { brightness: 1.03, contrast: 0.94, saturation: 1.09, temperature: 12, sharpness: -3 };
  }

  if (cameraStyle === "crisp") {
    return { brightness: 1.01, contrast: 1.2, saturation: 1.08, temperature: 0, sharpness: 15 };
  }

  return { brightness: 1, contrast: 0.88, saturation: 0.85, temperature: -2, sharpness: -1 };
}

function resolveFocusParams(focusStyle: RenderFocusStyle, toneStyle: RenderToneStyle): Partial<FilterParams> {
  if (focusStyle === "center" || focusStyle === "manual") {
    if (toneStyle === "bw") {
      return {
        contrast: 1.06,
        vignette: 0.08,
        blurBackground: 0.06,
      };
    }

    return {
      vignette: 0.07,
      blurBackground: 0.05,
    };
  }

  return {};
}

function mergeRenderParams(...layers: Array<Partial<FilterParams>>): FilterParams {
  return layers.reduce<FilterParams>(
    (current, next) => ({
      brightness: clamp(current.brightness * (next.brightness ?? 1), 0.85, 1.18),
      contrast: clamp(current.contrast * (next.contrast ?? 1), 0.8, 1.3),
      saturation: next.saturation === undefined ? current.saturation : clamp(current.saturation * next.saturation, 0, 1.36),
      temperature: clamp(current.temperature + (next.temperature ?? 0), -12, 14),
      sharpness: clamp(current.sharpness + (next.sharpness ?? 0), -8, 18),
      grain: clamp(current.grain + (next.grain ?? 0), 0, 14),
      fade: clamp(current.fade + (next.fade ?? 0), 0, 14),
      vignette: clamp(current.vignette + (next.vignette ?? 0), 0, 0.15),
      blurBackground: clamp(current.blurBackground + (next.blurBackground ?? 0), 0, 0.08),
    }),
    resolveToneParams("none"),
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveRenderCssFilter(config: RenderConfig): string {
  const filters = [
    config.toneStyle === "bw" ? "grayscale(1)" : null,
    config.toneStyle === "film" ? "sepia(0.14)" : null,
    `brightness(${config.params.brightness.toFixed(3)})`,
    `contrast(${config.params.contrast.toFixed(3)})`,
    `saturate(${config.params.saturation.toFixed(3)})`,
  ].filter(Boolean);

  return filters.join(" ");
}

export function resolveRenderSvgOverlay(config: RenderConfig, filterStrength: number): string {
  const strength = Math.min(100, Math.max(0, filterStrength)) / 100;
  const alpha = (value: number) => (value * strength).toFixed(3);
  const temperatureOverlay =
    config.params.temperature > 0
      ? `<rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 218, 188, ${alpha(config.params.temperature / 120)})" />`
      : config.params.temperature < 0
        ? `<rect x="0" y="0" width="1080" height="1350" fill="rgba(210, 230, 255, ${alpha(Math.abs(config.params.temperature) / 120)})" />`
        : "";
  const fadeOverlay =
    config.params.fade > 0
      ? `<rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 244, 226, ${alpha(config.params.fade / 130)})" />`
      : "";
  const crispOverlay =
    config.params.sharpness > 0
      ? `<rect x="0" y="0" width="1080" height="1350" fill="rgba(18, 22, 28, ${alpha(config.params.sharpness / 420)})" />`
      : "";
  const softOverlay =
    config.params.sharpness < 0
      ? `<rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 250, 244, ${alpha(Math.abs(config.params.sharpness) / 160)})" />`
      : "";
  const vignetteOverlay =
    config.params.vignette > 0
      ? `<rect x="0" y="0" width="1080" height="1350" fill="rgba(19,16,13,${alpha(config.params.vignette)})" />`
      : "";

  return [resolveCameraStyleOverlay(config.cameraStyle, config.toneStyle, filterStrength), temperatureOverlay, fadeOverlay, crispOverlay, softOverlay, vignetteOverlay]
    .filter(Boolean)
    .join("\n");
}

function resolveCameraStyleOverlay(
  cameraStyle: CameraStyle,
  toneStyle: RenderToneStyle,
  filterStrength: number,
): string {
  if (cameraStyle === "none") {
    return "";
  }

  const internalStyle = CAMERA_STYLE_INTERNAL[cameraStyle];
  const strength = Math.min(100, Math.max(0, filterStrength)) / 100;
  const alpha = (value: number) => (value * strength).toFixed(3);

  if (toneStyle === "bw") {
    return "";
  }

  if (internalStyle === "iphone-like") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(245, 250, 255, ${alpha(0.06)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 250, 236, ${alpha(0.04)})" />
    `.trim();
  }

  if (internalStyle === "canon-like") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 206, 174, ${alpha(0.14)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 242, 222, ${alpha(0.08)})" />
    `.trim();
  }

  if (internalStyle === "sony-like") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(218, 235, 255, ${alpha(0.08)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(20, 24, 32, ${alpha(0.08)})" />
    `.trim();
  }

  return `
    <rect x="0" y="0" width="1080" height="1350" fill="rgba(230, 222, 204, ${alpha(0.1)})" />
    <rect x="0" y="0" width="1080" height="1350" fill="rgba(32, 27, 22, ${alpha(0.045)})" />
  `.trim();
}

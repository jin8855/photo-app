import type {
  ContentFocusArea,
  ContentFocusStyle,
  ContentFrameStyle,
  ContentFrameTextColor,
  ContentImageFitMode,
  ContentOverlayStyle,
  InstagramOutputAspectRatio,
} from "@/lib/types/content";
import type { RenderConfig } from "@/services/content/content-render-config";
import { buildRenderConfig, resolveRenderSvgOverlay } from "@/services/content/content-render-config";
import { resolveInstagramOutputFormat } from "@/services/content/instagram-output-format";

type RenderSurface = {
  width: number;
  height: number;
};

export type PreviewRenderState = {
  imageUrl: string;
  captionText: string;
  outputRatio?: InstagramOutputAspectRatio;
  frameStyle: ContentFrameStyle;
  imageFitMode: ContentImageFitMode;
  focusStyle: ContentFocusStyle;
  focusArea: ContentFocusArea;
  frameTextColor: ContentFrameTextColor;
};

export type PreviewLayout = {
  imageUrl: string;
  captionText: string;
  ratio?: InstagramOutputAspectRatio;
  frameStyle: ContentFrameStyle;
  fit: ContentImageFitMode;
  focus: ContentFocusStyle;
  focusArea: ContentFocusArea;
  frameTextColor: ContentFrameTextColor;
};

export function buildPreviewLayout(state: PreviewRenderState): PreviewLayout {
  return {
    imageUrl: state.imageUrl,
    captionText: state.captionText,
    ratio: state.outputRatio,
    frameStyle: state.frameStyle,
    fit: state.imageFitMode,
    focus: state.focusStyle,
    focusArea: state.focusArea,
    frameTextColor: state.frameTextColor,
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitOverlayLines(value: string): string[] {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  if (normalized.length <= 16) {
    return [normalized];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > 16 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      continue;
    }

    currentLine = nextLine;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2);
}

function inputSafeOffset(_position: ContentOverlayStyle["position"], value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function resolveOverlayPosition(
  position: ContentOverlayStyle["position"],
  lineCount: number,
  surface: RenderSurface,
) {
  const scaleX = surface.width / 1080;
  const scaleY = surface.height / 1350;
  const gap = 72 * scaleY;
  const baseYByPosition = {
    top_left: 320,
    top_center: 320,
    top_right: 320,
    left_center: 720,
    center: 720,
    right_center: 720,
    bottom_left: 980,
    bottom_center: 980,
    bottom_right: 980,
  } as const;
  const baseY = baseYByPosition[position] * scaleY;
  const totalHeight = Math.max(lineCount - 1, 0) * gap;
  const xByPosition = {
    top_left: 88,
    top_center: 540,
    top_right: 992,
    left_center: 88,
    center: 540,
    right_center: 992,
    bottom_left: 88,
    bottom_center: 540,
    bottom_right: 992,
  } as const;
  const anchorByPosition = {
    top_left: "start",
    top_center: "middle",
    top_right: "end",
    left_center: "start",
    center: "middle",
    right_center: "end",
    bottom_left: "start",
    bottom_center: "middle",
    bottom_right: "end",
  } as const;
  const x = xByPosition[position] * scaleX;
  const anchor = anchorByPosition[position];

  return {
    x: x + inputSafeOffset(position, 0),
    anchor,
    baseY:
      position === "center" || position === "left_center" || position === "right_center"
        ? baseY - totalHeight / 2
        : baseY,
  };
}

function resolveFontFamily(fontFamily: ContentOverlayStyle["fontFamily"]): string {
  if (fontFamily === "serif") {
    return "Georgia, 'Times New Roman', serif";
  }

  if (fontFamily === "mono") {
    return "'Courier New', monospace";
  }

  if (fontFamily === "display") {
    return "Impact, Haettenschweiler, 'Arial Black', sans-serif";
  }

  if (fontFamily === "handwritten") {
    return "'Brush Script MT', 'Segoe Print', cursive";
  }

  return "Arial, sans-serif";
}

function resolveFontSize(fontSize: ContentOverlayStyle["fontSize"]): number {
  if (fontSize === "xxsmall") {
    return 34;
  }

  if (fontSize === "xsmall") {
    return 40;
  }

  if (fontSize === "small") {
    return 48;
  }

  if (fontSize === "medium") {
    return 56;
  }

  if (fontSize === "large") {
    return 64;
  }

  if (fontSize === "xlarge") {
    return 72;
  }

  return 82;
}

function resolveFontWeight(fontWeight: ContentOverlayStyle["fontWeight"]): number {
  if (fontWeight === "medium") {
    return 500;
  }

  if (fontWeight === "semibold") {
    return 600;
  }

  return 700;
}

function resolveTextColor(textColor: ContentOverlayStyle["textColor"]): string {
  if (textColor === "cream") {
    return "#f8ecd9";
  }

  if (textColor === "blush") {
    return "#f2c8cd";
  }

  if (textColor === "sage") {
    return "#d7ead9";
  }

  if (textColor === "sky") {
    return "#d8ebff";
  }

  if (textColor === "warm") {
    return "#f3d7c0";
  }

  if (textColor === "dark") {
    return "#1f1b17";
  }

  return "#fffaf4";
}

function resolveImageFilterOverlay(
  imageFilter: ContentOverlayStyle["imageFilter"],
  filterStrength: number,
): string {
  const strength = Math.min(100, Math.max(0, filterStrength)) / 100;
  const alpha = (value: number) => (value * strength).toFixed(3);

  if (imageFilter === "soft_warm") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(226, 162, 111, ${alpha(0.16)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 244, 226, ${alpha(0.08)})" />
    `.trim();
  }

  if (imageFilter === "moody_night") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(16, 20, 34, ${alpha(0.28)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(72, 92, 138, ${alpha(0.12)})" />
    `.trim();
  }

  if (imageFilter === "fog_calm") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(220, 228, 238, ${alpha(0.18)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 255, 255, ${alpha(0.12)})" />
    `.trim();
  }

  if (imageFilter === "nature_fresh") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(88, 145, 118, ${alpha(0.14)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(219, 244, 229, ${alpha(0.08)})" />
    `.trim();
  }

  if (imageFilter === "black_and_white") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(19, 16, 13, ${alpha(0.14)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 250, 244, ${alpha(0.05)})" />
    `.trim();
  }

  if (imageFilter === "travel_film") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(165, 118, 76, ${alpha(0.16)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(46, 31, 22, ${alpha(0.08)})" />
    `.trim();
  }

  if (imageFilter === "film_frame") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(170, 112, 70, ${alpha(0.14)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 235, 196, ${alpha(0.09)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(35, 24, 18, ${alpha(0.08)})" />
    `.trim();
  }

  if (imageFilter === "portrait_focus") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 244, 226, ${alpha(0.05)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(19, 16, 13, ${alpha(0.08)})" />
    `.trim();
  }

  if (imageFilter === "dawn_blue") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(96, 136, 189, ${alpha(0.18)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(219, 234, 255, ${alpha(0.10)})" />
    `.trim();
  }

  if (imageFilter === "vintage_cream") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(222, 198, 156, ${alpha(0.16)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 247, 231, ${alpha(0.14)})" />
    `.trim();
  }

  if (imageFilter === "rose_mood") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(184, 110, 123, ${alpha(0.16)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(252, 227, 232, ${alpha(0.10)})" />
    `.trim();
  }

  if (imageFilter === "sunset_orange") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(226, 126, 66, ${alpha(0.18)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(255, 220, 180, ${alpha(0.10)})" />
    `.trim();
  }

  return "";
}

function resolveImageFilterId(imageFilter: ContentOverlayStyle["imageFilter"]): string {
  if (imageFilter === "black_and_white") {
    return "grayscaleImage";
  }

  if (imageFilter === "film_frame" || imageFilter === "travel_film" || imageFilter === "vintage_cream") {
    return "filmToneImage";
  }

  return "";
}

function scaleFullSurfaceRects(svg: string, surface: RenderSurface): string {
  return svg.replaceAll(
    'width="1080" height="1350"',
    `width="${surface.width}" height="${surface.height}"`,
  );
}

function resolveFocusGeometry(renderConfig: RenderConfig, surface: RenderSurface) {
  const centerX = Math.round(renderConfig.focusArea.centerX * surface.width);
  const centerY = Math.round(renderConfig.focusArea.centerY * surface.height);
  const radius = Math.round(renderConfig.focusArea.radius * surface.width);

  return { centerX, centerY, radius };
}

function renderBaseImage(
  imageDataUrl: string,
  imageFilter: ContentOverlayStyle["imageFilter"],
  renderConfig: RenderConfig,
  surface: RenderSurface,
): string {
  const resolveFramedMatFill = () => {
    if (renderConfig.frameStyle === "minimal") {
      return "rgba(255,255,255,0.96)";
    }

    if (renderConfig.cameraStyle === "crisp" && renderConfig.toneStyle === "none") {
      return "rgba(255,255,255,0.98)";
    }

    if (imageFilter === "film_frame" || imageFilter === "travel_film" || imageFilter === "vintage_cream") {
      return "rgba(241,238,231,0.96)";
    }

    if (renderConfig.toneStyle === "bw") {
      return "rgba(241,238,231,0.98)";
    }

    return "rgba(247,244,238,0.98)";
  };
  const filterId = resolveImageFilterId(imageFilter);
  const filterAttribute = filterId ? ` filter="url(#${filterId})"` : "";
  const focusBlurPixels = Math.min(3, Math.max(1.8, renderConfig.params.blurBackground * 48));
  const focusBaseFilter = [
    filterId ? `url(#${filterId})` : null,
    `blur(${focusBlurPixels.toFixed(1)}px)`,
    "brightness(0.85)",
  ]
    .filter(Boolean)
    .join(" ");
  const preserveAspectRatio =
    renderConfig.imageFitMode === "cover" ? "xMidYMid slice" : "xMidYMid meet";
  const imageFrame = `x="0" y="0" width="${surface.width}" height="${surface.height}" preserveAspectRatio="${preserveAspectRatio}"`;
  const framedMatNode =
    renderConfig.imageFitMode === "cover"
      ? ""
      : `<rect x="0" y="0" width="${surface.width}" height="${surface.height}" fill="${resolveFramedMatFill()}" />`;
  const baseImage = `<image href="${imageDataUrl}" ${imageFrame}${filterAttribute} />`;

  if (renderConfig.focusStyle === "none") {
    return `${framedMatNode}${baseImage}`.trim();
  }

  const { centerX, centerY, radius } = resolveFocusGeometry(renderConfig, surface);
  const focusFilterAttribute =
    renderConfig.toneStyle === "bw" && renderConfig.focusColorMode === "color-pop"
      ? ""
      : filterAttribute;

  return `
    ${framedMatNode}
    <image href="${imageDataUrl}" ${imageFrame} style="filter: ${focusBaseFilter}" />
    <image href="${imageDataUrl}" ${imageFrame}${focusFilterAttribute} clip-path="url(#portraitFocusClip)" />
    <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="rgba(255,250,244,0.22)" stroke-width="4" />
  `.trim();
}

function renderStyleFrame(imageFilter: ContentOverlayStyle["imageFilter"], surface: RenderSurface): string {
  if (imageFilter === "film_frame") {
    const now = new Date();
    const dateStamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(
      now.getDate(),
    ).padStart(2, "0")}`;

    const outer = { x: 34, y: 34, width: surface.width - 68, height: surface.height - 68 };
    const inner = { x: 58, y: 58, width: surface.width - 116, height: surface.height - 116 };
    const labelY = surface.height - 90;

    return `
      <rect x="${outer.x}" y="${outer.y}" width="${outer.width}" height="${outer.height}" rx="16" ry="16" fill="none" stroke="rgba(255,245,224,0.86)" stroke-width="24" />
      <rect x="${inner.x}" y="${inner.y}" width="${inner.width}" height="${inner.height}" rx="12" ry="12" fill="none" stroke="rgba(33,23,18,0.28)" stroke-width="2" />
      <text x="104" y="${labelY}" fill="rgba(255,245,224,0.92)" font-size="30" font-weight="700" font-family="'Courier New', monospace">${dateStamp}</text>
      <text x="${surface.width - 170}" y="${labelY}" fill="rgba(255,245,224,0.78)" font-size="24" font-weight="700" font-family="'Courier New', monospace" text-anchor="end">FILM</text>
    `.trim();
  }

  if (imageFilter === "black_and_white") {
    return `<rect x="30" y="30" width="${surface.width - 60}" height="${surface.height - 60}" rx="24" ry="24" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="2" />`;
  }

  if (imageFilter === "portrait_focus") {
    return `<rect x="46" y="46" width="${surface.width - 92}" height="${surface.height - 92}" rx="34" ry="34" fill="none" stroke="rgba(255,250,244,0.22)" stroke-width="2" />`;
  }

  return "";
}

function renderFrameOverlay(style: ContentOverlayStyle, surface: RenderSurface): string {
  const frameStyle = style.frameStyle;
  const frameTextColor = style.frameTextColor ?? "white";
  const resolveFrameTextFill = (opacity: number) => {
    if (frameTextColor === "black") {
      return `rgba(34,28,24,${opacity})`;
    }

    if (frameTextColor === "brown") {
      return `rgba(104,74,54,${opacity})`;
    }

    if (frameTextColor === "cream") {
      return `rgba(255,246,226,${opacity})`;
    }

    return `rgba(255,255,255,${opacity})`;
  };
  const resolveFrameTextShadow = () =>
    frameTextColor === "black"
      ? "rgba(255,255,255,0.32)"
      : frameTextColor === "brown"
        ? "rgba(36,22,16,0.28)"
        : "rgba(0,0,0,0.45)";
  const dateStampText =
    style.dateStampEnabled === true
      ? (style.dateStampValue ?? "").trim() ||
        `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, "0")}.${String(
          new Date().getDate(),
        ).padStart(2, "0")}`
      : "";
  const filmNumberText =
    style.filmNumberEnabled === true ? (style.filmNumberValue ?? "").trim().slice(0, 12) || "FRAME 01" : "";
  if (frameStyle === "vintageFilmBorder") {
    const outer = { x: 34, y: 34, width: surface.width - 68, height: surface.height - 68 };
    const inner = { x: 58, y: 58, width: surface.width - 116, height: surface.height - 116 };
    const labelY = surface.height - 90;

    return `
      <rect x="${outer.x}" y="${outer.y}" width="${outer.width}" height="${outer.height}" rx="16" ry="16" fill="none" stroke="rgba(255,245,224,0.86)" stroke-width="24" />
      <rect x="${inner.x}" y="${inner.y}" width="${inner.width}" height="${inner.height}" rx="12" ry="12" fill="none" stroke="rgba(33,23,18,0.28)" stroke-width="2" />
      ${dateStampText ? `<text x="104" y="${labelY}" fill="${resolveFrameTextFill(0.92)}" font-size="30" font-weight="700" font-family="'Courier New', monospace">${escapeXml(dateStampText)}</text>` : ""}
      ${filmNumberText ? `<text x="${surface.width / 2}" y="${labelY}" fill="${resolveFrameTextFill(0.76)}" font-size="21" font-weight="700" font-family="'Courier New', monospace" text-anchor="middle">${escapeXml(filmNumberText)}</text>` : ""}
      <text x="${surface.width - 170}" y="${labelY}" fill="rgba(255,245,224,0.78)" font-size="24" font-weight="700" font-family="'Courier New', monospace" text-anchor="end">FILM</text>
    `.trim();
  }

  if (frameStyle === "polaroid") {
    const outerInsetX = Math.round(surface.width * 0.024);
    const outerInsetTop = Math.round(surface.height * 0.024);
    const outerInsetBottom = Math.round(surface.height * 0.086);
    const width = surface.width - outerInsetX * 2;
    const height = surface.height - outerInsetTop - outerInsetBottom;
    const captionY = surface.height - outerInsetBottom / 2 + 10;
    const frameText = (style.frameText ?? "").trim().slice(0, 24);

    return `
      <rect x="${outerInsetX}" y="${outerInsetTop}" width="${width}" height="${height}" rx="16" ry="16" fill="none" stroke="rgba(255,252,247,0.96)" stroke-width="18" />
      <rect x="${outerInsetX + 12}" y="${outerInsetTop + 12}" width="${width - 24}" height="${height - 24}" rx="10" ry="10" fill="none" stroke="rgba(96,74,58,0.08)" stroke-width="1.5" />
      ${dateStampText ? `<text x="${surface.width / 2}" y="${captionY - 16}" fill="${resolveFrameTextFill(0.76)}" font-size="18" font-weight="600" font-family="Arial, sans-serif" text-anchor="middle">${escapeXml(dateStampText)}</text>` : ""}
      ${frameText
        ? `<text x="${surface.width / 2}" y="${captionY + 16}" fill="${resolveFrameTextFill(0.86)}" font-size="24" font-weight="700" font-family="Arial, sans-serif" text-anchor="middle">${escapeXml(frameText)}</text>`
        : ""}
    `.trim();
  }

  if (frameStyle === "minimal") {
    return `
      <rect x="22" y="22" width="${surface.width - 44}" height="${surface.height - 44}" rx="20" ry="20" fill="none" stroke="rgba(255,250,244,0.82)" stroke-width="2" />
      ${dateStampText ? `<text x="${surface.width - 40}" y="${surface.height - 42}" fill="${resolveFrameTextFill(0.78)}" font-size="18" font-weight="600" font-family="Arial, sans-serif" text-anchor="end">${escapeXml(dateStampText)}</text>` : ""}
    `.trim();
  }

  if (frameStyle === "cinemaFilm") {
    const barHeight = Math.max(42, Math.round(surface.height * 0.068));
    const holeWidth = Math.max(8, Math.round(surface.width * 0.012));
    const holeHeight = Math.max(10, Math.round(barHeight * 0.26));
    const holeGap = Math.max(26, Math.round(surface.width * 0.026));
    const holeCount = Math.floor(surface.width / holeGap);
    const holes = Array.from({ length: holeCount }, (_, index) => {
      const cx = Math.round(holeGap * index + holeGap / 2);
      const x = Math.round(cx - holeWidth / 2);
      const topY = Math.round(barHeight / 2 - holeHeight / 2);
      const bottomY = Math.round(surface.height - barHeight / 2 - holeHeight / 2);
      return `
        <rect x="${x}" y="${topY}" width="${holeWidth}" height="${holeHeight}" rx="${Math.round(holeWidth / 2)}" ry="${Math.round(holeWidth / 2)}" fill="black" />
        <rect x="${x}" y="${bottomY}" width="${holeWidth}" height="${holeHeight}" rx="${Math.round(holeWidth / 2)}" ry="${Math.round(holeWidth / 2)}" fill="black" />
      `.trim();
    }).join("");

    return `
      <mask id="cinemaFilmMask">
        <rect x="0" y="0" width="${surface.width}" height="${surface.height}" fill="white" />
        ${holes}
      </mask>
      <rect x="0" y="0" width="${surface.width}" height="${barHeight}" fill="rgba(12,10,9,0.96)" mask="url(#cinemaFilmMask)" />
      <rect x="0" y="${surface.height - barHeight}" width="${surface.width}" height="${barHeight}" fill="rgba(12,10,9,0.96)" mask="url(#cinemaFilmMask)" />
      <rect x="0" y="${Math.round(barHeight - 2)}" width="${surface.width}" height="1" fill="rgba(255,250,244,0.12)" />
      <rect x="0" y="${surface.height - barHeight + 1}" width="${surface.width}" height="1" fill="rgba(255,250,244,0.12)" />
      ${filmNumberText ? `<text x="36" y="${surface.height - Math.round(barHeight * 0.3)}" fill="${resolveFrameTextShadow()}" font-size="21" font-weight="700" font-family="'Courier New', monospace">${escapeXml(filmNumberText)}</text>` : ""}
      ${filmNumberText ? `<text x="36" y="${surface.height - Math.round(barHeight * 0.32)}" fill="${resolveFrameTextFill(0.88)}" font-size="21" font-weight="700" font-family="'Courier New', monospace">${escapeXml(filmNumberText)}</text>` : ""}
      ${dateStampText ? `<text x="${surface.width - 36}" y="${surface.height - Math.round(barHeight * 0.32)}" fill="${resolveFrameTextFill(0.8)}" font-size="20" font-weight="700" font-family="'Courier New', monospace" text-anchor="end">${escapeXml(dateStampText)}</text>` : ""}
    `.trim();
  }

  return "";
}

function resolveTextShadow(shadow: ContentOverlayStyle["shadow"]): string {
  if (shadow === "soft") {
    return "0 10px 24px rgba(19,16,13,0.28)";
  }

  if (shadow === "strong") {
    return "0 14px 30px rgba(19,16,13,0.42)";
  }

  return "none";
}

function resolveBackground(background: ContentOverlayStyle["background"]): {
  fill: string;
  stroke: string;
} | null {
  if (background === "soft_dark") {
    return {
      fill: "rgba(19,16,13,0.34)",
      stroke: "rgba(255,250,244,0.14)",
    };
  }

  if (background === "soft_light") {
    return {
      fill: "rgba(255,250,244,0.82)",
      stroke: "rgba(64,47,30,0.12)",
    };
  }

  return null;
}

function resolveLineGap(lineHeight: ContentOverlayStyle["lineHeight"]): number {
  if (lineHeight === "tight") {
    return 60;
  }

  if (lineHeight === "relaxed") {
    return 84;
  }

  return 72;
}

function variantUnit(seed: number, offset: number): number {
  const value = Math.sin((seed + 1) * 12.9898 + offset * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function renderInstagramContentSvg(input: {
  imageDataUrl: string;
  overlayText: string;
  moodCategory: string;
  overlayStyle: ContentOverlayStyle;
  renderVariant?: number;
}): string {
  const lines = splitOverlayLines(input.overlayText);
  const escapedMood = escapeXml(input.moodCategory);
  const renderVariant = Math.max(0, input.renderVariant ?? 0);
  const outputFormat = resolveInstagramOutputFormat(input.overlayStyle.aspectRatio);
  const surface = { width: outputFormat.width, height: outputFormat.height };
  const position = resolveOverlayPosition(input.overlayStyle.position, lines.length, surface);
  const adjustedBaseY =
    position.baseY + inputSafeOffset(input.overlayStyle.position, input.overlayStyle.yOffset);
  const fontSize = resolveFontSize(input.overlayStyle.fontSize);
  const fontWeight = resolveFontWeight(input.overlayStyle.fontWeight);
  const fontFamily = resolveFontFamily(input.overlayStyle.fontFamily);
  const textColor = resolveTextColor(input.overlayStyle.textColor);
  const imageFilterOverlay = scaleFullSurfaceRects(
    resolveImageFilterOverlay(input.overlayStyle.imageFilter, input.overlayStyle.filterStrength),
    surface,
  );
  const renderConfig = buildRenderConfig(input.overlayStyle);
  const cameraStyleOverlay = scaleFullSurfaceRects(
    resolveRenderSvgOverlay(renderConfig, input.overlayStyle.filterStrength),
    surface,
  );
  const textShadow = resolveTextShadow(input.overlayStyle.shadow);
  const background = resolveBackground(input.overlayStyle.background);
  const lineGap = resolveLineGap(input.overlayStyle.lineHeight);
  const adjustedX = position.x + inputSafeOffset(input.overlayStyle.position, input.overlayStyle.xOffset);
  const boxWidth = position.anchor === "middle" ? 720 : 620;
  const boxX =
    position.anchor === "middle"
      ? adjustedX - boxWidth / 2
      : position.anchor === "end"
        ? adjustedX - boxWidth
        : adjustedX - 28;
  const boxHeight = Math.max(lines.length, 1) * lineGap + 52;
  const boxY = adjustedBaseY - fontSize * 0.9;
  const backgroundNode = background
    ? `<rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" rx="28" ry="28" fill="${background.fill}" stroke="${background.stroke}" stroke-width="1" />`
    : "";
  const textStyle = textShadow === "none" ? "" : ` style="filter: drop-shadow(${textShadow});"`;
  const topGradientOpacity = (0.03 + variantUnit(renderVariant, 1) * 0.06).toFixed(3);
  const bottomGradientOpacity = (0.66 + variantUnit(renderVariant, 2) * 0.18).toFixed(3);
  const frameOpacity = (0.1 + variantUnit(renderVariant, 3) * 0.12).toFixed(3);
  const accentOpacity = (0.08 + variantUnit(renderVariant, 4) * 0.1).toFixed(3);
  const accentX = Math.round(180 + variantUnit(renderVariant, 5) * 720);
  const accentY = Math.round(surface.height * 0.16 + variantUnit(renderVariant, 6) * surface.height * 0.61);
  const accentRadius = Math.round(120 + variantUnit(renderVariant, 7) * 90);
  const accentColor =
    input.overlayStyle.imageFilter === "soft_warm" || input.overlayStyle.imageFilter === "sunset_orange"
      ? "244, 178, 120"
      : input.overlayStyle.imageFilter === "dawn_blue"
        ? "157, 198, 255"
        : input.overlayStyle.imageFilter === "nature_fresh"
          ? "155, 213, 171"
          : "255, 244, 226";
  const baseImageNode = renderBaseImage(input.imageDataUrl, input.overlayStyle.imageFilter, renderConfig, surface);
  const styleFrameNode = renderStyleFrame(input.overlayStyle.imageFilter, surface);
  const frameOverlayNode = renderFrameOverlay(input.overlayStyle, surface);
  const overlayGradientNode =
    input.overlayStyle.frameStyle === "none"
      ? `<rect x="0" y="0" width="${surface.width}" height="${surface.height}" fill="url(#overlayGradient)" />`
      : "";

  const lineNodes = lines
    .map((line, index) => {
      const y = adjustedBaseY + index * lineGap;

      return `<text x="${adjustedX}" y="${y}" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="${fontFamily}" text-anchor="${position.anchor}"${textStyle}>${escapeXml(
        line,
      )}</text>`;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${surface.width}" height="${surface.height}" viewBox="0 0 ${surface.width} ${surface.height}">
      <defs>
        <linearGradient id="overlayGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(19,16,13,${topGradientOpacity})" />
          <stop offset="100%" stop-color="rgba(19,16,13,${bottomGradientOpacity})" />
        </linearGradient>
        <radialGradient id="accentGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(${accentColor}, ${accentOpacity})" />
          <stop offset="100%" stop-color="rgba(${accentColor}, 0)" />
        </radialGradient>
        <filter id="grayscaleImage">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.08" intercept="-0.03" />
            <feFuncG type="linear" slope="1.08" intercept="-0.03" />
            <feFuncB type="linear" slope="1.08" intercept="-0.03" />
          </feComponentTransfer>
        </filter>
        <filter id="filmToneImage">
          <feColorMatrix type="matrix" values="1.04 0.03 0.01 0 0.02 0.02 0.96 0.02 0 0.01 0.01 0.02 0.86 0 0 0 0 0 1 0" />
        </filter>
        <clipPath id="portraitFocusClip">
          <circle cx="${resolveFocusGeometry(renderConfig, surface).centerX}" cy="${resolveFocusGeometry(renderConfig, surface).centerY}" r="${resolveFocusGeometry(renderConfig, surface).radius}" />
        </clipPath>
      </defs>
      ${baseImageNode}
      ${imageFilterOverlay}
      ${cameraStyleOverlay}
      <circle cx="${accentX}" cy="${accentY}" r="${accentRadius}" fill="url(#accentGlow)" />
      ${overlayGradientNode}
      <rect x="28" y="28" width="${surface.width - 56}" height="${surface.height - 56}" rx="36" ry="36" fill="none" stroke="rgba(255,250,244,${frameOpacity})" stroke-width="2" />
      ${styleFrameNode}
      <rect x="72" y="72" rx="28" ry="28" width="240" height="64" fill="rgba(255,250,244,0.88)" />
      <text x="108" y="114" fill="#7a4123" font-size="28" font-weight="700" font-family="Arial, sans-serif">${escapedMood}</text>
      ${backgroundNode}
      ${lineNodes}
      ${frameOverlayNode}
    </svg>
  `.trim();
}

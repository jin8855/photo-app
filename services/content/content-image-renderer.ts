import type { ContentOverlayStyle } from "@/lib/types/content";

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

function resolveOverlayPosition(position: ContentOverlayStyle["position"], lineCount: number) {
  const gap = 72;
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
  const baseY = baseYByPosition[position];
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
  const x = xByPosition[position];
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

  if (imageFilter === "travel_film") {
    return `
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(165, 118, 76, ${alpha(0.16)})" />
      <rect x="0" y="0" width="1080" height="1350" fill="rgba(46, 31, 22, ${alpha(0.08)})" />
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
  const position = resolveOverlayPosition(input.overlayStyle.position, lines.length);
  const adjustedBaseY =
    position.baseY + inputSafeOffset(input.overlayStyle.position, input.overlayStyle.yOffset);
  const fontSize = resolveFontSize(input.overlayStyle.fontSize);
  const fontWeight = resolveFontWeight(input.overlayStyle.fontWeight);
  const fontFamily = resolveFontFamily(input.overlayStyle.fontFamily);
  const textColor = resolveTextColor(input.overlayStyle.textColor);
  const imageFilterOverlay = resolveImageFilterOverlay(
    input.overlayStyle.imageFilter,
    input.overlayStyle.filterStrength,
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
  const accentY = Math.round(220 + variantUnit(renderVariant, 6) * 820);
  const accentRadius = Math.round(120 + variantUnit(renderVariant, 7) * 90);
  const accentColor =
    input.overlayStyle.imageFilter === "soft_warm" || input.overlayStyle.imageFilter === "sunset_orange"
      ? "244, 178, 120"
      : input.overlayStyle.imageFilter === "dawn_blue"
        ? "157, 198, 255"
        : input.overlayStyle.imageFilter === "nature_fresh"
          ? "155, 213, 171"
          : "255, 244, 226";

  const lineNodes = lines
    .map((line, index) => {
      const y = adjustedBaseY + index * lineGap;

      return `<text x="${adjustedX}" y="${y}" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="${fontFamily}" text-anchor="${position.anchor}"${textStyle}>${escapeXml(
        line,
      )}</text>`;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
      <defs>
        <linearGradient id="overlayGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(19,16,13,${topGradientOpacity})" />
          <stop offset="100%" stop-color="rgba(19,16,13,${bottomGradientOpacity})" />
        </linearGradient>
        <radialGradient id="accentGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(${accentColor}, ${accentOpacity})" />
          <stop offset="100%" stop-color="rgba(${accentColor}, 0)" />
        </radialGradient>
      </defs>
      <image href="${input.imageDataUrl}" x="0" y="0" width="1080" height="1350" preserveAspectRatio="xMidYMid slice" />
      ${imageFilterOverlay}
      <circle cx="${accentX}" cy="${accentY}" r="${accentRadius}" fill="url(#accentGlow)" />
      <rect x="0" y="0" width="1080" height="1350" fill="url(#overlayGradient)" />
      <rect x="28" y="28" width="1024" height="1294" rx="36" ry="36" fill="none" stroke="rgba(255,250,244,${frameOpacity})" stroke-width="2" />
      <rect x="72" y="72" rx="28" ry="28" width="240" height="64" fill="rgba(255,250,244,0.88)" />
      <text x="108" y="114" fill="#7a4123" font-size="28" font-weight="700" font-family="Arial, sans-serif">${escapedMood}</text>
      ${backgroundNode}
      ${lineNodes}
    </svg>
  `.trim();
}

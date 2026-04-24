import type { PhotoAnalysisResult } from "@/lib/types/analysis";
import { photoTipTemplatesByStyle } from "@/services/tips/photo-tip-content";
import type {
  PhotoTip,
  PhotoTipCategory,
  PhotoTipDeviceType,
  PhotoTipInput,
} from "@/services/tips/photo-tip-types";

const MAX_TIPS = 5;

const fallbackTipByCategory: Record<PhotoTipCategory, PhotoTip> = {
  composition: {
    category: "composition",
    title: "주제 주변 정리",
    short: "가장 보여주고 싶은 대상 주변을 조금 비워보세요.",
  },
  lighting: {
    category: "lighting",
    title: "밝기 먼저 맞추기",
    short: "주제를 눌러 밝기를 맞춰보세요.",
  },
  color: {
    category: "color",
    title: "색은 한 단계만",
    short: "채도는 한 단계만 조정해보세요.",
  },
  retake: {
    category: "retake",
    title: "한 장 더 넓게",
    short: "다시 찍는다면 조금 더 넓게 담아보세요.",
  },
  device: {
    category: "device",
    title: "렌즈를 닦고 시작",
    short: "촬영 전 렌즈를 한번 닦아보세요.",
  },
};

export function getPhotoTipsForAnalysis(
  analysis: PhotoAnalysisResult,
  deviceType?: PhotoTipDeviceType | null,
): PhotoTip[] {
  return getPhotoTips({
    sceneType: analysis.scene_type,
    moodCategory: analysis.mood_category,
    photoStyleType: analysis.photo_style_type,
    wallpaperScore: analysis.wallpaper_score,
    socialScore: analysis.social_score,
    commercialScore: analysis.commercial_score,
    deviceType,
  });
}

export function getPhotoTips(input: PhotoTipInput): PhotoTip[] {
  const baseTips = photoTipTemplatesByStyle[input.photoStyleType] ?? [];
  const tipsByCategory = new Map<PhotoTipCategory, PhotoTip>();

  for (const tip of baseTips) {
    tipsByCategory.set(tip.category, {
      ...tip,
      tooltipKey: `photoTips.${tip.category}`,
    });
  }

  applyScoreHints(input, tipsByCategory);
  applySceneHints(input, tipsByCategory);
  applyDeviceHints(input, tipsByCategory);

  return getOrderedCategories(input)
    .map((category) => tipsByCategory.get(category) ?? fallbackTipByCategory[category])
    .map((tip) => enrichPhotoTip(tip, input))
    .slice(0, MAX_TIPS);
}

function enrichPhotoTip(tip: PhotoTip, input: PhotoTipInput): PhotoTip {
  const expanded = expandedCopyByCategory[tip.category];
  const hasDeviceContext = Boolean(input.deviceType);

  return {
    ...tip,
    detail: tip.detail ?? expanded.detail,
    why: tip.why ?? expanded.why,
    when: tip.when ?? expanded.when,
    example: tip.example ?? expanded.example,
    relatedSettingHint: tip.relatedSettingHint ?? expanded.relatedSettingHint,
    deviceHint: hasDeviceContext ? tip.deviceHint ?? getDeviceHint(input.deviceType) : undefined,
  };
}

const expandedCopyByCategory: Record<
  PhotoTipCategory,
  Required<Pick<PhotoTip, "detail" | "why" | "when" | "example">> &
    Pick<PhotoTip, "relatedSettingHint">
> = {
  composition: {
    detail: "화면 안에서 주제가 차지하는 비중을 먼저 정하면 사진의 중심이 더 분명해집니다.",
    why: "배경이 많거나 선이 어지러우면 시선이 분산됩니다.",
    when: "인물, 음식, 자동차, 풍경처럼 주제가 분명한 사진일 때",
    example: "차량 사진이라면 차가 나아가는 쪽을 비워 속도감을 남겨보세요.",
  },
  lighting: {
    detail: "가장 보여주고 싶은 부분의 밝기를 먼저 맞추면 전체 인상이 안정됩니다.",
    why: "밝은 하늘이나 조명이 기준이 되면 주제가 어둡게 묻힐 수 있습니다.",
    when: "역광, 야경, 실내 조명, 연기나 안개가 있는 장면일 때",
    example: "얼굴, 음식, 차량처럼 주제가 되는 부분을 눌러 밝기를 먼저 확인하세요.",
    relatedSettingHint: "노출을 살짝 낮추면 밝은 부분이 덜 날아갈 수 있습니다.",
  },
  color: {
    detail: "색은 한두 가지 방향만 살리면 사진 분위기가 더 또렷해집니다.",
    why: "색을 많이 올리면 주제보다 보정 느낌이 먼저 보일 수 있습니다.",
    when: "봄꽃, 음식, 차량 컬러, 노을처럼 색이 중요한 사진일 때",
    example: "차량 사진은 배경보다 차체 색이 먼저 보이도록 대비를 정리해보세요.",
    relatedSettingHint: "채도와 대비는 한 단계씩만 조정해도 충분합니다.",
  },
  retake: {
    detail: "다시 찍을 수 있다면 같은 장면을 다른 거리와 방향으로 한 장 더 남겨보세요.",
    why: "한 장만 있으면 문구 배치나 자르기 선택지가 줄어듭니다.",
    when: "SNS 이미지, 판매 이미지, 썸네일처럼 후반 활용이 필요한 사진일 때",
    example: "가까운 컷 하나, 넓은 컷 하나를 함께 남기면 결과 이미지 만들기가 쉬워집니다.",
  },
  device: {
    detail: "기기 기능은 장면을 보조하는 정도로만 쓰면 사진이 더 자연스럽습니다.",
    why: "줌이나 야간 모드를 과하게 쓰면 흔들림, 노이즈, 왜곡이 늘 수 있습니다.",
    when: "어두운 곳, 빠른 움직임, 멀리 있는 피사체를 찍을 때",
    example: "먼 피사체는 디지털 확대보다 안정적인 배율 줌을 먼저 써보세요.",
    relatedSettingHint: "렌즈를 닦고 초점 고정을 먼저 하면 대부분의 흐림이 줄어듭니다.",
  },
};

function getDeviceHint(deviceType?: PhotoTipDeviceType | null): string | undefined {
  if (!deviceType) {
    return undefined;
  }

  if (deviceType === "galaxy_s25_ultra" || deviceType === "galaxy_s26_ultra") {
    return "Galaxy Ultra 계열은 1배와 3배를 함께 찍어두면 구도 선택지가 넓어집니다.";
  }

  return "일반 스마트폰은 기본 렌즈와 화면 터치 초점만 잘 써도 선명도가 안정됩니다.";
}

function getOrderedCategories(input: PhotoTipInput): PhotoTipCategory[] {
  const sceneText = `${input.sceneType} ${input.moodCategory}`.toLowerCase();
  const scorePriority = getScorePriority(input);
  const typePriority = getTypePriority(input, sceneText);

  return uniqueCategories([
    ...scorePriority,
    ...typePriority,
    "composition",
    "lighting",
    "color",
    "retake",
    "device",
  ]);
}

function getScorePriority(input: PhotoTipInput): PhotoTipCategory[] {
  const scoreHints: Array<{ category: PhotoTipCategory; score: number }> = [];

  if (typeof input.wallpaperScore === "number" && input.wallpaperScore < 72) {
    scoreHints.push({ category: "composition", score: input.wallpaperScore });
  }

  if (typeof input.socialScore === "number" && input.socialScore < 72) {
    scoreHints.push({ category: "color", score: input.socialScore });
  }

  if (typeof input.commercialScore === "number" && input.commercialScore < 72) {
    scoreHints.push({ category: "retake", score: input.commercialScore });
  }

  return scoreHints
    .sort((left, right) => left.score - right.score)
    .map((item) => item.category);
}

function getTypePriority(input: PhotoTipInput, sceneText: string): PhotoTipCategory[] {
  if (hasAny(sceneText, ["night", "밤"])) {
    return ["lighting", "composition", "color", "retake", "device"];
  }

  if (hasAny(sceneText, ["food", "dish", "cafe", "meal", "음식", "카페", "디저트"])) {
    return ["lighting", "composition", "color", "retake", "device"];
  }

  if (hasAny(sceneText, ["portrait", "person", "people", "face", "인물", "사람", "얼굴"])) {
    return ["lighting", "composition", "retake", "color", "device"];
  }

  if (
    input.photoStyleType === "action_speed" ||
    input.photoStyleType === "sports_energy" ||
    hasAny(sceneText, ["drift", "racing", "motorsport", "automotive", "car", "드리프트", "레이싱", "자동차"])
  ) {
    return ["composition", "retake", "lighting", "color", "device"];
  }

  if (hasAny(sceneText, ["landscape", "mountain", "river", "sea", "forest", "풍경", "산", "강", "바다", "숲"])) {
    return ["composition", "color", "retake", "lighting", "device"];
  }

  return ["composition", "lighting", "color", "retake", "device"];
}

function uniqueCategories(categories: PhotoTipCategory[]): PhotoTipCategory[] {
  return categories.filter((category, index) => categories.indexOf(category) === index);
}

function applyScoreHints(
  input: PhotoTipInput,
  tipsByCategory: Map<PhotoTipCategory, PhotoTip>,
): void {
  if (typeof input.wallpaperScore === "number" && input.wallpaperScore < 72) {
    tipsByCategory.set("composition", {
      category: "composition",
      title: "여백을 조금 더 만들기",
      short: "문구를 얹을 공간을 한쪽에 남겨보세요. 완성 이미지가 더 쓰기 좋아집니다.",
      tooltipKey: "photoTips.composition",
    });
  }

  if (typeof input.socialScore === "number" && input.socialScore < 72) {
    tipsByCategory.set("color", {
      category: "color",
      title: "작은 화면 기준으로 보기",
      short: "휴대폰 화면에서 한 번 더 확인해보세요. 대비를 살짝 올리면 더 잘 보입니다.",
      tooltipKey: "photoTips.color",
    });
  }

  if (typeof input.commercialScore === "number" && input.commercialScore < 72) {
    tipsByCategory.set("retake", {
      category: "retake",
      title: "활용컷 하나 더 찍기",
      short: "다시 찍는다면 같은 장면을 조금 더 넓게 담아보세요. 판매나 소개에 쓰기 좋아집니다.",
      tooltipKey: "photoTips.retake",
    });
  }
}

function applySceneHints(
  input: PhotoTipInput,
  tipsByCategory: Map<PhotoTipCategory, PhotoTip>,
): void {
  const sceneText = `${input.sceneType} ${input.moodCategory}`.toLowerCase();

  if (hasAny(sceneText, ["drift", "racing", "motorsport", "automotive", "car", "드리프트", "레이싱", "자동차"])) {
    tipsByCategory.set("composition", {
      category: "composition",
      title: "움직이는 방향 열기",
      short: "차가 빠져나가는 쪽을 넓게 남겨보세요. 속도감이 더 세게 살아납니다.",
      tooltipKey: "photoTips.composition",
    });
    tipsByCategory.set("retake", {
      category: "retake",
      title: "연기 올라올 때 잡기",
      short: "다시 찍는다면 타이어 연기가 올라오는 순간을 연속 촬영으로 잡아보세요.",
      tooltipKey: "photoTips.retake",
    });
    return;
  }

  if (hasAny(sceneText, ["portrait", "person", "people", "face", "인물", "사람", "얼굴"])) {
    tipsByCategory.set("composition", {
      category: "composition",
      title: "눈높이에 맞추기",
      short: "카메라를 눈높이에 맞춰보세요. 표정이 더 편하게 보입니다.",
      tooltipKey: "photoTips.composition",
    });
    tipsByCategory.set("lighting", {
      category: "lighting",
      title: "얼굴 밝기 먼저 맞추기",
      short: "얼굴 쪽을 눌러 밝기를 맞춰보세요. 인상이 더 자연스럽게 살아납니다.",
      tooltipKey: "photoTips.lighting",
    });
    tipsByCategory.set("retake", {
      category: "retake",
      title: "한두 걸음 떨어지기",
      short: "다시 찍는다면 한두 걸음 떨어져보세요. 얼굴 왜곡이 줄어듭니다.",
      tooltipKey: "photoTips.retake",
    });
  }

  if (hasAny(sceneText, ["food", "dish", "cafe", "meal", "음식", "카페", "디저트"])) {
    tipsByCategory.set("composition", {
      category: "composition",
      title: "접시 가장자리 살리기",
      short: "접시 가장자리를 조금 남겨보세요. 음식이 더 정돈돼 보입니다.",
      tooltipKey: "photoTips.composition",
    });
    tipsByCategory.set("lighting", {
      category: "lighting",
      title: "창가 빛으로 옮기기",
      short: "창가 쪽 빛을 써보세요. 음식 색이 더 먹음직스럽게 살아납니다.",
      tooltipKey: "photoTips.lighting",
    });
    tipsByCategory.set("color", {
      category: "color",
      title: "따뜻한 톤 살리기",
      short: "색온도를 살짝 따뜻하게 잡아보세요. 음식의 온기가 더 잘 보입니다.",
      tooltipKey: "photoTips.color",
    });
  }

  if (hasAny(sceneText, ["landscape", "mountain", "river", "sea", "forest", "풍경", "산", "강", "바다", "숲"])) {
    tipsByCategory.set("composition", {
      category: "composition",
      title: "하늘과 땅 비율 잡기",
      short: "하늘이나 땅 중 더 중요한 쪽을 넓게 담아보세요. 장면이 더 분명해집니다.",
      tooltipKey: "photoTips.composition",
    });
    tipsByCategory.set("color", {
      category: "color",
      title: "자연색 유지하기",
      short: "초록과 파랑은 살짝만 올려보세요. 풍경의 편안함이 유지됩니다.",
      tooltipKey: "photoTips.color",
    });
    tipsByCategory.set("retake", {
      category: "retake",
      title: "가로 사진도 남기기",
      short: "다시 찍는다면 가로 구도도 함께 남겨보세요. 공간감이 더 넓어집니다.",
      tooltipKey: "photoTips.retake",
    });
  }

  if (sceneText.includes("night") || sceneText.includes("밤")) {
    tipsByCategory.set("lighting", {
      category: "lighting",
      title: "밝은 점 기준 잡기",
      short: "가로등이나 간판을 눌러 밝기를 맞춰보세요. 밤 분위기가 더 안정됩니다.",
      tooltipKey: "photoTips.lighting",
    });
  }

  if (sceneText.includes("fog") || sceneText.includes("안개")) {
    tipsByCategory.set("color", {
      category: "color",
      title: "대비는 조금만",
      short: "대비를 조금만 올려보세요. 부드러운 깊이가 유지됩니다.",
      tooltipKey: "photoTips.color",
    });
  }
}

function hasAny(value: string, tokens: string[]): boolean {
  return tokens.some((token) => value.includes(token));
}

function applyDeviceHints(
  input: PhotoTipInput,
  tipsByCategory: Map<PhotoTipCategory, PhotoTip>,
): void {
  if (!input.deviceType) {
    return;
  }

  if (input.deviceType === "galaxy_s25_ultra" || input.deviceType === "galaxy_s26_ultra") {
    tipsByCategory.set("device", {
      category: "device",
      title: "3배 줌도 같이 찍기",
      short: "같은 장면을 1배와 3배로 함께 남겨보세요. 분위기 선택지가 넓어집니다.",
      tooltipKey: "photoTips.device",
    });
    return;
  }

  tipsByCategory.set("device", {
    category: "device",
    title: "기본 렌즈로 먼저 찍기",
    short: "일반 스마트폰은 기본 렌즈로 먼저 찍어보세요. 색과 선명도가 안정됩니다.",
    tooltipKey: "photoTips.device",
  });
}

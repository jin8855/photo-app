import {
  shootingGuideDeviceTypes,
  shootingGuideDistances,
  shootingGuideMappings,
  shootingGuideSituations,
  shootingGuideSubjects,
} from "@/services/shooting-guide/shooting-guide-catalog";
import type {
  ShootingContext,
  ShootingDistance,
  ShootingExampleImage,
  ShootingGuideEntry,
  ShootingSituation,
  ShootingSubject,
  ShootingTip,
  ShootingTipMapping,
} from "@/services/shooting-guide/shooting-guide-types";

const MAX_TIPS = 5;
const DEFAULT_COPY_DIRECTIONS: Record<ShootingDistance, string[]> = {
  close_up: [
    "작은 디테일이 선명하게 남는 방향",
    "가까이 볼수록 질감이 살아나는 방향",
    "피사체 하나에 감정을 집중하는 방향",
  ],
  medium: [
    "대상과 분위기가 함께 보이는 방향",
    "장면의 감정을 균형 있게 담는 방향",
    "설명보다 분위기가 먼저 느껴지는 방향",
  ],
  wide: [
    "공간 전체가 감정을 만드는 방향",
    "멀리서 봐야 더 크게 보이는 방향",
    "장면보다 오래 남는 분위기를 살리는 방향",
  ],
};
const DEFAULT_EXAMPLE_IMAGES: Record<ShootingDistance, ShootingExampleImage[]> = {
  close_up: [
    {
      src: "/samples/shooting-guide/default-close-up.jpg",
      fallbackSrc: "/samples/default_close_up.svg",
      label: "접사 예시",
    },
  ],
  medium: [
    {
      src: "/samples/shooting-guide/default-medium.jpg",
      fallbackSrc: "/samples/default_medium.svg",
      label: "중간 거리 예시",
    },
  ],
  wide: [
    {
      src: "/samples/shooting-guide/default-wide.jpg",
      fallbackSrc: "/samples/default_wide.svg",
      label: "원경 예시",
    },
  ],
};

export function listShootingGuideSituations() {
  return shootingGuideSituations;
}

export function listShootingGuideCategories() {
  return shootingGuideSituations;
}

export function listShootingGuideDeviceTypes() {
  return shootingGuideDeviceTypes;
}

export function listShootingGuideDistances() {
  return shootingGuideDistances;
}

export function listShootingGuideSubjects() {
  return shootingGuideSubjects;
}

export function getShootingGuide(context: ShootingContext): ShootingGuideEntry;
export function getShootingGuide(
  situation: ShootingSituation,
  subject: ShootingSubject,
  distance: ShootingDistance,
  deviceType: ShootingContext["deviceType"],
): ShootingGuideEntry;
export function getShootingGuide(
  contextOrSituation: ShootingContext | ShootingSituation,
  subject?: ShootingSubject,
  distance?: ShootingDistance,
  deviceType?: ShootingContext["deviceType"],
): ShootingGuideEntry {
  const context =
    typeof contextOrSituation === "string"
      ? {
          situation: contextOrSituation,
          subject: subject ?? "person",
          distance: distance ?? "medium",
          deviceType: deviceType ?? "generic_smartphone",
        }
      : contextOrSituation;

  return {
    context,
    tips: getMatchedTips(context),
  };
}

function getMatchedTips(context: ShootingContext): ShootingTip[] {
  const exact = findMappings((mapping) => {
    return (
      mapping.situation === context.situation &&
      mapping.subject === context.subject &&
      mapping.distance === context.distance
    );
  });
  const situationAndSubject = findMappings((mapping) => {
    return (
      mapping.situation === context.situation &&
      mapping.subject === context.subject &&
      mapping.distance === "default"
    );
  });
  const subjectAndDistance = findMappings((mapping) => {
    return (
      mapping.situation === "default" &&
      mapping.subject === context.subject &&
      mapping.distance === context.distance
    );
  });
  const subjectOnly = findMappings((mapping) => {
    return (
      mapping.situation === "default" &&
      mapping.subject === context.subject &&
      mapping.distance === "default"
    );
  });
  const fallback = findMappings((mapping) => {
    return (
      mapping.situation === "default" &&
      mapping.subject === "default" &&
      mapping.distance === "default"
    );
  });

  return uniqueTips([...exact, ...situationAndSubject, ...subjectAndDistance, ...subjectOnly, ...fallback])
    .map((tip) => applyDeviceSettingHint(tip, context.deviceType))
    .map((tip) => applyExampleImages(tip, context.distance))
    .map((tip) => applyCopyDirection(tip, context.distance))
    .slice(0, MAX_TIPS);
}

function findMappings(predicate: (mapping: ShootingTipMapping) => boolean): ShootingTip[] {
  return shootingGuideMappings.filter(predicate).flatMap((mapping) => mapping.tips);
}

function uniqueTips(tips: ShootingTip[]): ShootingTip[] {
  const seen = new Set<string>();

  return tips.filter((tip) => {
    if (seen.has(tip.tipTitle)) {
      return false;
    }

    seen.add(tip.tipTitle);
    return true;
  });
}

function applyDeviceSettingHint(
  tip: ShootingTip,
  deviceType: ShootingContext["deviceType"],
): ShootingTip {
  if (deviceType === "galaxy_s25_ultra" || deviceType === "galaxy_s26_ultra") {
    return {
      ...tip,
      phoneCameraHint:
        tip.phoneCameraHint ??
        "Galaxy Ultra 계열은 1배와 3배를 함께 남기면 나중에 고르기 좋습니다.",
    };
  }

  return {
    ...tip,
    phoneCameraHint:
      tip.phoneCameraHint ?? "일반 스마트폰은 기본 렌즈와 터치 초점부터 맞추는 것이 안정적입니다.",
  };
}

function applyExampleImages(tip: ShootingTip, distance: ShootingDistance): ShootingTip {
  const exampleImages = (tip.exampleImages?.slice(0, 2) ?? DEFAULT_EXAMPLE_IMAGES[distance]).map(
    (image) => ({
      ...image,
      alt: image.alt ?? image.label,
    }),
  );

  return {
    ...tip,
    exampleImages,
  };
}

function applyCopyDirection(tip: ShootingTip, distance: ShootingDistance): ShootingTip {
  return {
    ...tip,
    recommendedCopyDirection:
      tip.recommendedCopyDirection?.slice(0, 3) ?? DEFAULT_COPY_DIRECTIONS[distance],
  };
}

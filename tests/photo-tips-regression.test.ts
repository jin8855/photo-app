import { getPhotoTips } from "@/services/tips/photo-tip-service";
import type { PhotoStyleType } from "@/lib/types/analysis";

type PhotoTipRegressionCase = {
  name: string;
  sceneType: string;
  moodCategory: string;
  photoStyleType: PhotoStyleType;
  requiredTokens: string[];
  forbiddenTokens: string[];
};

const regressionCases: PhotoTipRegressionCase[] = [
  {
    name: "portrait",
    sceneType: "portrait",
    moodCategory: "soft person mood",
    photoStyleType: "other",
    requiredTokens: ["눈높이", "얼굴", "표정"],
    forbiddenTokens: ["차", "타이어", "접시", "밤 분위기"],
  },
  {
    name: "food",
    sceneType: "food",
    moodCategory: "warm cafe",
    photoStyleType: "other",
    requiredTokens: ["접시", "음식", "창가", "따뜻"],
    forbiddenTokens: ["차", "타이어", "얼굴", "밤 분위기"],
  },
  {
    name: "landscape",
    sceneType: "landscape",
    moodCategory: "natural healing",
    photoStyleType: "natural_healing",
    requiredTokens: ["하늘", "땅", "자연", "가로"],
    forbiddenTokens: ["접시", "얼굴", "타이어", "간판"],
  },
  {
    name: "night",
    sceneType: "night street",
    moodCategory: "urban mood",
    photoStyleType: "urban_mood",
    requiredTokens: ["가로등", "간판", "밤 분위기"],
    forbiddenTokens: ["접시", "타이어", "음식"],
  },
  {
    name: "automotive_action",
    sceneType: "drift racing automotive",
    moodCategory: "speed control",
    photoStyleType: "action_speed",
    requiredTokens: ["차", "속도감", "타이어", "연속 촬영"],
    forbiddenTokens: ["접시", "얼굴", "위로", "괜찮"],
  },
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

for (const testCase of regressionCases) {
  const tips = getPhotoTips({
    sceneType: testCase.sceneType,
    moodCategory: testCase.moodCategory,
    photoStyleType: testCase.photoStyleType,
    wallpaperScore: 90,
    socialScore: 90,
    commercialScore: 90,
  });
  const joined = tips.map((tip) => `${tip.title} ${tip.short}`).join("\n");

  assert(tips.length >= 3 && tips.length <= 5, `[${testCase.name}] tips length out of range`);
  assert(
    testCase.requiredTokens.some((token) => joined.includes(token)),
    `[${testCase.name}] expected scene-specific token missing. tips=${JSON.stringify(tips)}`,
  );
  assert(
    !testCase.forbiddenTokens.some((token) => joined.includes(token)),
    `[${testCase.name}] forbidden token leaked. tips=${JSON.stringify(tips)}`,
  );
  assert(!joined.includes("하지 마세요"), `[${testCase.name}] negative instruction leaked`);
  assert(!joined.includes("나쁩니다"), `[${testCase.name}] negative evaluation leaked`);
}

console.log("photo-tips regression passed");

import { MockPhotoAnalysisProvider } from "@/services/analyses/providers/mock-photo-analysis-provider";
import type { PhotoStyleType } from "@/lib/types/analysis";

type RegressionCase = {
  name: string;
  originalName: string;
  expectedStyleType: PhotoStyleType;
  requiredTokens: string[];
  forbiddenTokens: string[];
};

const regressionCases: RegressionCase[] = [
  {
    name: "풍경",
    originalName: "river-mountain-landscape.jpg",
    expectedStyleType: "natural_healing",
    requiredTokens: ["쉬", "숨", "천천히", "괜찮", "마음"],
    forbiddenTokens: ["브레이크", "라인", "밀어붙", "가속", "쾌감"],
  },
  {
    name: "봄",
    originalName: "spring-flower-walk.jpg",
    expectedStyleType: "spring_healing",
    requiredTokens: ["괜찮", "좋", "다시", "편안", "따뜻"],
    forbiddenTokens: ["브레이크", "라인", "공격", "심장", "쾌감"],
  },
  {
    name: "안개",
    originalName: "fog-road-morning.jpg",
    expectedStyleType: "reflective_fog",
    requiredTokens: ["답", "방향", "생각", "멈", "어디"],
    forbiddenTokens: ["브레이크", "라인", "밀어붙", "쾌감", "가속"],
  },
  {
    name: "한옥",
    originalName: "hanok-korea-travel.jpg",
    expectedStyleType: "travel_korean",
    requiredTokens: ["기억", "공기", "여행", "남", "순간"],
    forbiddenTokens: ["브레이크", "라인", "공격", "가속", "쾌감"],
  },
  {
    name: "액션 (드리프트)",
    originalName: "drift-racing-track.jpg",
    expectedStyleType: "action_speed",
    requiredTokens: ["속도", "브레이크", "밀어붙", "멈출", "라인", "심장", "제어"],
    forbiddenTokens: ["괜찮아", "버텨", "생각나는 밤", "조용한 밤", "위로"],
  },
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function run(): Promise<void> {
  const provider = new MockPhotoAnalysisProvider();

  for (const testCase of regressionCases) {
    const result = await provider.analyze({
      photoId: 1,
      originalName: testCase.originalName,
      filePath: `/tmp/${testCase.originalName}`,
    });

    const topPhrases = result.phrases.slice(0, 5).map((item) => item.phrase);
    const joined = topPhrases.join("\n");

    assert(
      result.photo_style_type === testCase.expectedStyleType,
      `[${testCase.name}] expected style ${testCase.expectedStyleType}, received ${result.photo_style_type}`,
    );

    assert(
      testCase.requiredTokens.some((token) => joined.includes(token)),
      `[${testCase.name}] top phrases do not match expected mood. phrases=${JSON.stringify(topPhrases)}`,
    );

    assert(
      !testCase.forbiddenTokens.some((token) => joined.includes(token)),
      `[${testCase.name}] forbidden phrase leaked into result. phrases=${JSON.stringify(topPhrases)}`,
    );
  }

  console.log("photo-style regression passed");
}

void run();

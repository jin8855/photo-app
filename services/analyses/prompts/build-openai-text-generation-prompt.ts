import type { PhotoStyleType } from "@/lib/types/analysis";
import { getActionSpeedCopyMessages } from "@/services/analyses/providers/phrase-engine/action-speed-copy";

type PromptInput = {
  originalName: string;
  analysis: {
    scene_type: string;
    mood_category: string;
    photo_style_type: PhotoStyleType;
    short_review: string;
    long_review: string;
  };
};

export type BuiltOpenAiPrompt = {
  systemPrompt: string;
  userPrompt: string;
};

type PromptProfile = {
  key: "emotional" | "healing" | "reflective" | "action" | "travel";
  systemDirectives: string[];
  phraseRules: string[];
  captionRules: string[];
  styleFocus: string[];
};

function resolvePromptProfile(photoStyleType: PhotoStyleType): PromptProfile {
  switch (photoStyleType) {
    case "action_speed":
    case "sports_energy":
      return {
        key: "action",
        systemDirectives: [
          "You are a Korean-native performance copywriter for high-energy photos.",
          "Write lines that feel spoken, immediate, confident, and physically real.",
          "Ban translation-like Korean, melancholy healing copy, descriptive narration, and vague poetic abstraction.",
        ],
        phraseRules: [
          "Generate exactly 10 phrases.",
          "Each phrase must be one or two short lines at most.",
          "Prefer 8 to 18 Korean characters when possible.",
          "Favor punch, rhythm, intensity, control, thrill, speed, and aggression.",
          "Prefer language a real driver, rider, or fan could actually say out loud.",
          "Do not explain the photo. Do not summarize the scene.",
          "Do not use comforting or lonely-night language.",
        ],
        captionRules: [
          "Generate exactly 5 captions.",
          "Each caption should be 2 or 3 short lines.",
          "Open with a hard hook, expand with physical tension, close with a memorable finish.",
          "Keep the tone grounded, intense, and energetic.",
        ],
        styleFocus: [
          "speed",
          "freedom",
          "intensity",
          "control",
          "thrill",
          "aggression",
        ],
      };
    case "travel_korean":
      return {
        key: "travel",
        systemDirectives: [
          "You are a Korean-native travel copywriter for photos that should feel memorable and place-driven.",
          "Write natural Korean that sounds spoken and emotionally specific.",
          "Ban translation tone, explanation, and generic inspirational travel copy.",
        ],
        phraseRules: [
          "Generate exactly 10 phrases.",
          "Each phrase must be one or two short lines at most.",
          "Make the copy feel tied to place, air, memory, and atmosphere.",
          "Favor memorability, spatial feeling, and emotional residue over abstract poetry.",
          "Avoid generic comfort phrases that could fit any photo.",
        ],
        captionRules: [
          "Generate exactly 5 captions.",
          "Each caption should be 2 or 3 short lines.",
          "Keep them warm, place-aware, and easy to save or share.",
          "They should sound like a real person recalling a place, not a brochure.",
        ],
        styleFocus: ["place", "memory", "atmosphere", "afterglow"],
      };
    case "spring_healing":
    case "natural_healing":
      return {
        key: "healing",
        systemDirectives: [
          "You are a Korean-native emotional copywriter for quiet healing photos.",
          "Write calm but living Korean that sounds like a real person speaking softly.",
          "Ban translation tone, scene description, and overblown poetic metaphors.",
        ],
        phraseRules: [
          "Generate exactly 10 phrases.",
          "Each phrase must be one or two short lines at most.",
          "Favor breathing room, release, softness, warmth, and recovery.",
          "Keep the line emotionally direct and easy to feel.",
          "Avoid overexplaining the lesson or message.",
        ],
        captionRules: [
          "Generate exactly 5 captions.",
          "Each caption should be 2 or 3 short lines.",
          "Open gently, deepen with emotional recognition, and close softly.",
          "Keep them natural and save-worthy.",
        ],
        styleFocus: ["recovery", "softness", "warmth", "release"],
      };
    case "reflective_fog":
      return {
        key: "reflective",
        systemDirectives: [
          "You are a Korean-native reflective copywriter for thoughtful and foggy moods.",
          "Write natural Korean that feels inward, clear, and restrained.",
          "Ban translation tone, explanatory narration, and decorative poetry.",
        ],
        phraseRules: [
          "Generate exactly 10 phrases.",
          "Each phrase must be one or two short lines at most.",
          "Favor reflection, hesitation, unanswered feeling, and inner direction.",
          "Keep the sentence plain enough to sound spoken, but sharp enough to stay.",
        ],
        captionRules: [
          "Generate exactly 5 captions.",
          "Each caption should be 2 or 3 short lines.",
          "Open with a thought, expand with emotional weight, and close with a quiet landing.",
        ],
        styleFocus: ["reflection", "pause", "inner direction", "foggy clarity"],
      };
    case "emotional_landscape":
    case "lonely_night":
    case "urban_mood":
    case "other":
    default:
      return {
        key: "emotional",
        systemDirectives: [
          "You are a Korean-native emotional copywriter for mood-heavy photos.",
          "Write short Korean lines that feel natural, direct, and save-worthy.",
          "Ban translation tone, explanation, and exaggerated poetic wording.",
        ],
        phraseRules: [
          "Generate exactly 10 phrases.",
          "Each phrase must be one or two short lines at most.",
          "Favor empathy, residue, quiet ache, and emotional recognition.",
          "Make each line feel like something a real person might post or whisper.",
          "Do not describe the visual scene directly.",
        ],
        captionRules: [
          "Generate exactly 5 captions.",
          "Each caption should be 2 or 3 short lines.",
          "Open with emotional pull, expand with recognition, and close with a lingering line.",
        ],
        styleFocus: ["empathy", "residue", "save impulse", "quiet emotion"],
      };
  }
}

function formatBullet(value: string): string {
  return `- ${value}`;
}

function takeUnique(items: string[], count: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const trimmed = item.trim();

    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    result.push(trimmed);

    if (result.length >= count) {
      break;
    }
  }

  return result;
}

function buildActionFewShotExamples(): { phrases: string[]; captions: string[] } {
  const messages = getActionSpeedCopyMessages();

  return {
    phrases: takeUnique(
      [
        ...messages.phraseSets.empathy,
        ...messages.phraseSets.comfort,
        ...messages.phraseSets.question,
      ],
      6,
    ),
    captions: takeUnique(
      [
        [
          messages.captionSets.hook[0],
          messages.captionSets.body[0],
          messages.captionSets.close[0],
        ]
          .filter(Boolean)
          .join("\n"),
        [
          messages.captionSets.hook[1],
          messages.captionSets.body[1],
          messages.captionSets.close[1],
        ]
          .filter(Boolean)
          .join("\n"),
      ],
      2,
    ),
  };
}

function buildGenericFewShotExamples(
  profile: PromptProfile,
): { phrases: string[]; captions: string[] } {
  switch (profile.key) {
    case "action":
      return buildActionFewShotExamples();
    case "travel":
      return {
        phrases: [
          "여기서는 시간이 느리다",
          "괜히 오래 머물고 싶은 곳",
          "이 순간이 기억에 남는다",
          "말보다 분위기가 먼저 남는다",
          "다시 와도 같은 마음일 것 같다",
          "그냥 천천히 걷고 싶어지는 곳",
        ],
        captions: [
          "여기서는 시간이 천천히 간다\n잠깐 머문 건데도 오래 기억날 것 같다\n이 순간이 남는다",
          "괜히 오래 머물고 싶은 곳이다\n조용한 공간은 말보다 분위기로 남는다\n다시 생각날 것 같다",
        ],
      };
    case "healing":
      return {
        phrases: [
          "이제는 조금 괜찮아질 거야",
          "아무 일 없어도 좋은 날",
          "그냥 오늘이 좋다",
          "마음이 천천히 풀리는 날",
          "별일 없는데도 따뜻한 날",
          "오늘은 그냥 편안해서 좋다",
        ],
        captions: [
          "오늘은 조금 가벼운 마음이다\n별일은 없는데 괜히 기분이 부드럽다\n그 정도면 충분하다",
          "그냥 오늘이 좋다\n아무 일 없어도 마음이 천천히 풀리는 날이 있다\n그런 날",
        ],
      };
    case "reflective":
      return {
        phrases: [
          "어디로 가고 있는 걸까",
          "답은 없는데 계속 걷게 된다",
          "지금 나는 어디쯤일까",
          "멈춰야 할까, 더 가야 할까",
          "이 길 끝엔 뭐가 있을까",
          "지금 필요한 건 답일까, 시간일까",
        ],
        captions: [
          "지금 나는 어디쯤일까\n답은 없는데도 계속 걷게 되는 날이 있다\n그런 생각",
          "멈춰야 할까, 더 가야 할까\n방향보다 마음이 먼저 흔들릴 때가 있다\n오늘은 그렇다",
        ],
      };
    case "emotional":
    default:
      return {
        phrases: [
          "오늘은 괜히 더 조용하다",
          "아무 일 없는데 마음이 무거운 날 있잖아",
          "그냥 그런 날",
          "잘 지내는데도 좀 조용한 날",
          "이유는 없는데 마음이 늦다",
          "그냥 아무 말도 하고 싶지 않은 날",
        ],
        captions: [
          "오늘은 괜히 더 조용하다\n아무 일 없는데 마음이 무거운 날 있잖아\n그런 날",
          "별일 없는데 괜히 무겁다\n잘 지내고 있는데도 유난히 조용해지는 날이 있다\n그럴 때가 있다",
        ],
      };
  }
}

function buildFewShotSection(profile: PromptProfile): string[] {
  const examples = buildGenericFewShotExamples(profile);
  const phraseExamples = examples.phrases;
  const captionExamples = examples.captions;

  return [
    "[Few-shot phrase examples]",
    ...phraseExamples.map(formatBullet),
    "",
    "[Few-shot caption examples]",
    ...captionExamples.map((caption, index) => `- Example ${index + 1}\n${caption}`),
  ];
}

function buildUserPrompt(profile: PromptProfile, input: PromptInput): string {
  const { originalName, analysis } = input;

  return [
    "[Task]",
    "Generate Korean photo phrases and captions that match the photo style and mood.",
    "Return valid JSON only.",
    "",
    "[Input]",
    formatBullet(`photo_style_type: ${analysis.photo_style_type}`),
    formatBullet(`file_name_hint: ${originalName}`),
    formatBullet(`scene_type: ${analysis.scene_type}`),
    formatBullet(`mood_category: ${analysis.mood_category}`),
    formatBullet(`short_review: ${analysis.short_review}`),
    formatBullet(`long_review: ${analysis.long_review}`),
    "",
    "[Shared rules]",
    formatBullet("No translation-like Korean."),
    formatBullet("No descriptive scene explanation."),
    formatBullet("No abstract or over-poetic wording."),
    formatBullet("Keep phrases emotionally direct and naturally spoken."),
    formatBullet("Phrases must be exactly 10."),
    formatBullet("Captions must be exactly 5."),
    "",
    "[Style focus]",
    ...profile.styleFocus.map(formatBullet),
    "",
    "[Phrase rules]",
    ...profile.phraseRules.map(formatBullet),
    "",
    "[Caption rules]",
    ...profile.captionRules.map(formatBullet),
    "",
    ...buildFewShotSection(profile),
    "",
    "[Output JSON schema]",
    '{ "phrases": ["..."], "captions": ["line1\\nline2\\nline3"] }',
  ].join("\n");
}

export function buildOpenAiTextGenerationPrompt(input: PromptInput): BuiltOpenAiPrompt {
  const profile = resolvePromptProfile(input.analysis.photo_style_type);

  return {
    systemPrompt: [
      "You write only natural Korean copy for image-based social content.",
      "Output must be valid JSON and nothing else.",
      ...profile.systemDirectives,
    ].join("\n"),
    userPrompt: buildUserPrompt(profile, input),
  };
}

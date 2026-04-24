import koMessages from "@/i18n/messages/ko.json";
import type { PhotoStyleType, ScoredCaption, ScoredPhrase } from "@/lib/types/analysis";
import { getActionSpeedCopyMessages } from "@/services/analyses/providers/phrase-engine/action-speed-copy";
import { resolvePhraseEngineStrategy } from "@/services/analyses/providers/phrase-engine/strategy-registry";
import type { PhraseCandidate, PhraseKind } from "@/services/analyses/providers/phrase-engine/types";

export type MockPreset = {
  file_hints: string[];
  scene_type: string;
  mood_category: string;
  photo_style_type?: PhotoStyleType;
  short_review: string;
  long_review: string;
  recommended_text_position: string;
  wallpaper_score: number;
  social_score: number;
  commercial_score: number;
  phrase_sets: {
    empathy: string[];
    comfort: string[];
    question: string[];
  };
  phrase_patterns?: {
    empathy: {
      starts: string[];
      ends: string[];
    };
    comfort: {
      starts: string[];
      ends: string[];
    };
    question: {
      starts: string[];
      ends: string[];
    };
  };
  caption_sets: {
    emotion: string[];
    expansion: string[];
    pause: string[];
  };
  hashtags: string[];
};

export type MockAnalysisMessages = {
  presets: MockPreset[];
  scoring: {
    keywords: {
      emotion: string[];
      empathy: string[];
      action?: string[];
    };
    reasons: {
      emotion: string;
      empathy: string;
      concise: string;
      fresh: string;
      repetitive: string;
    };
  };
};

export type ResolvedAnalysisMetadata = {
  sceneType: string;
  moodCategory: string;
  shortReview: string;
  longReview: string;
  recommendedTextPosition: string;
  wallpaperScore: number;
  socialScore: number;
  commercialScore: number;
  hashtags: string[];
};

type PhraseScoringProfile = {
  quotas: Record<PhraseKind, number>;
  caps: Record<PhraseKind, number>;
  emotionBase: number;
  empathyBase: number;
  conciseBase: number;
  emotionKeywordBonus: number;
  actionKeywordBonus: number;
  empathyKeywordBonus: number;
  conciseShortBonus: number;
  conciseMediumBonus: number;
  conciseLongPenalty: number;
  resonanceBonus: number;
  saveabilityBonus: number;
  impactBonus: number;
  rhythmBonus: number;
  intensityBonus: number;
  realismBonus: number;
  questionKindBonus: number;
  defaultKindBonus: number;
  freshnessBonus: number;
  topPickBoost: number;
};

export function getMockMessages(): MockAnalysisMessages {
  const messages = koMessages.analysisMock as MockAnalysisMessages;
  const actionKeywords = getActionSpeedCopyMessages().keywords;

  return {
    ...messages,
    scoring: {
      ...messages.scoring,
      keywords: {
        ...messages.scoring.keywords,
        action: messages.scoring.keywords.action ?? actionKeywords,
      },
    },
  };
}

function resolvePhraseScoringProfile(photoStyleType?: PhotoStyleType): PhraseScoringProfile {
  switch (photoStyleType) {
    case "action_speed":
    case "sports_energy":
      return {
        quotas: { empathy: 1, comfort: 6, question: 2 },
        caps: { empathy: 2, comfort: 7, question: 2 },
        emotionBase: 20,
        empathyBase: 8,
        conciseBase: 18,
        emotionKeywordBonus: 10,
        actionKeywordBonus: 28,
        empathyKeywordBonus: 6,
        conciseShortBonus: 22,
        conciseMediumBonus: 10,
        conciseLongPenalty: 12,
        resonanceBonus: 4,
        saveabilityBonus: 6,
        impactBonus: 22,
        rhythmBonus: 18,
        intensityBonus: 20,
        realismBonus: 16,
        questionKindBonus: 4,
        defaultKindBonus: 7,
        freshnessBonus: 10,
        topPickBoost: 18,
      };
    case "travel_korean":
      return {
        quotas: { empathy: 3, comfort: 5, question: 2 },
        caps: { empathy: 4, comfort: 6, question: 3 },
        emotionBase: 18,
        empathyBase: 14,
        conciseBase: 15,
        emotionKeywordBonus: 16,
        actionKeywordBonus: 4,
        empathyKeywordBonus: 12,
        conciseShortBonus: 12,
        conciseMediumBonus: 10,
        conciseLongPenalty: 6,
        resonanceBonus: 12,
        saveabilityBonus: 12,
        impactBonus: 4,
        rhythmBonus: 6,
        intensityBonus: 4,
        realismBonus: 8,
        questionKindBonus: 8,
        defaultKindBonus: 6,
        freshnessBonus: 12,
        topPickBoost: 10,
      };
    case "emotional_landscape":
    case "lonely_night":
    case "reflective_fog":
    case "spring_healing":
    case "natural_healing":
    case "urban_mood":
    case "other":
    default:
      return {
        quotas: { empathy: 4, comfort: 4, question: 2 },
        caps: { empathy: 5, comfort: 5, question: 3 },
        emotionBase: 18,
        empathyBase: 22,
        conciseBase: 15,
        emotionKeywordBonus: 14,
        actionKeywordBonus: 4,
        empathyKeywordBonus: 18,
        conciseShortBonus: 16,
        conciseMediumBonus: 10,
        conciseLongPenalty: 8,
        resonanceBonus: 18,
        saveabilityBonus: 16,
        impactBonus: 2,
        rhythmBonus: 4,
        intensityBonus: 2,
        realismBonus: 6,
        questionKindBonus: 8,
        defaultKindBonus: 6,
        freshnessBonus: 12,
        topPickBoost: 16,
      };
  }
}

function computeTopPickPriority(
  phrase: string,
  kind: PhraseKind,
  profile: PhraseScoringProfile,
  photoStyleType?: PhotoStyleType,
): number {
  const charLength = phrase.replace(/\s+/g, "").length;
  const tokenCount = phrase.split(/\s+/).filter(Boolean).length;
  const hasQuestion = phrase.includes("?");
  const isActionLike =
    photoStyleType === "action_speed" || photoStyleType === "sports_energy";
  const isTravelLike = photoStyleType === "travel_korean";
  const isEmotionalLike = !isActionLike && !isTravelLike;

  let priority = 0;

  if (isActionLike) {
    if (charLength <= 16) {
      priority += profile.topPickBoost;
    } else if (charLength <= 20) {
      priority += Math.round(profile.topPickBoost * 0.65);
    }

    if (tokenCount <= 4) {
      priority += 10;
    } else if (tokenCount <= 6) {
      priority += 5;
    }

    if (kind === "comfort") {
      priority += 8;
    }

    if (hasQuestion) {
      priority -= 10;
    }
  }

  if (isEmotionalLike) {
    if (kind === "empathy") {
      priority += profile.topPickBoost;
    } else if (kind === "comfort") {
      priority += Math.round(profile.topPickBoost * 0.5);
    }

    if (charLength >= 10 && charLength <= 22) {
      priority += 10;
    }

    if (hasQuestion) {
      priority -= 4;
    }
  }

  if (isTravelLike) {
    if (kind === "empathy") {
      priority += Math.round(profile.topPickBoost * 0.8);
    } else if (kind === "comfort") {
      priority += Math.round(profile.topPickBoost * 0.45);
    }

    if (charLength >= 10 && charLength <= 22) {
      priority += 8;
    }
  }

  return priority;
}

export function hashInput(value: string): number {
  return Array.from(value).reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) % 2147483647;
  }, 7);
}

export function normalizeSeedSource(originalName: string): string {
  return originalName.trim().toLowerCase();
}

export function takeRotated(items: string[], count: number, offset: number): string[] {
  if (items.length === 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    return items[(offset + index) % items.length];
  });
}

export function uniqueByOrder(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

export function buildPatternSentences(
  pattern:
    | {
        starts: string[];
        ends: string[];
      }
    | undefined,
  seed: number,
  count: number,
): string[] {
  if (!pattern || pattern.starts.length === 0 || pattern.ends.length === 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const pairIndex = (seed + index) % Math.min(pattern.starts.length, pattern.ends.length);
    const start = pattern.starts[pairIndex];
    const end = pattern.ends[pairIndex];
    return `${start}${end}`;
  });
}

function withKind(items: string[], kind: PhraseKind): PhraseCandidate[] {
  return items
    .map((phrase) => phrase.trim())
    .filter(Boolean)
    .map((phrase) => ({ phrase, kind }));
}

export function resolvePreset(
  messages: MockAnalysisMessages,
  originalName: string,
  seed: number,
): MockPreset {
  const normalized = normalizeSeedSource(originalName);
  const matched = messages.presets.find((preset) =>
    preset.file_hints.some((hint) => normalized.includes(hint.toLowerCase())),
  );

  if (matched) {
    return matched;
  }

  const hintedPhotoStyleType = resolvePhotoStyleTypeHint(originalName);

  if (hintedPhotoStyleType) {
    const sameStylePresets = messages.presets.filter(
      (preset) => (preset.photo_style_type ?? "other") === hintedPhotoStyleType,
    );

    if (sameStylePresets.length > 0) {
      return sameStylePresets[seed % sameStylePresets.length];
    }
  }

  return messages.presets[seed % messages.presets.length];
}

export function getPresetMatchSource(
  messages: MockAnalysisMessages,
  originalName: string,
): "hint" | "fallback" {
  const normalized = normalizeSeedSource(originalName);
  const matched = messages.presets.some((preset) =>
    preset.file_hints.some((hint) => normalized.includes(hint.toLowerCase())),
  );

  return matched ? "hint" : "fallback";
}

const photoStyleTypeHints: Array<{
  type: PhotoStyleType;
  hints: string[];
}> = [
  {
    type: "action_speed",
    hints: [
      "drift",
      "racing",
      "race",
      "track",
      "engine",
      "speed",
      "boost",
      "burnout",
      "tuning",
      "car",
    ],
  },
  {
    type: "sports_energy",
    hints: [
      "sport",
      "sports",
      "soccer",
      "football",
      "baseball",
      "basketball",
      "tennis",
      "run",
      "running",
      "marathon",
      "fitness",
      "gym",
      "workout",
      "athlete",
    ],
  },
  {
    type: "urban_mood",
    hints: [
      "urban",
      "city",
      "street",
      "neon",
      "subway",
      "downtown",
      "building",
      "alley",
      "metro",
      "nightdrive",
    ],
  },
  {
    type: "lonely_night",
    hints: ["night", "midnight", "dark", "lonely", "moon", "citynight"],
  },
  {
    type: "spring_healing",
    hints: ["spring", "flower", "blossom", "bloom", "petal", "greenery"],
  },
  {
    type: "reflective_fog",
    hints: ["fog", "mist", "cloud", "haze", "smoke"],
  },
  {
    type: "travel_korean",
    hints: [
      "travel",
      "trip",
      "journey",
      "seoul",
      "busan",
      "jeju",
      "hanok",
      "korea",
      "korean",
    ],
  },
  {
    type: "natural_healing",
    hints: ["forest", "nature", "tree", "mountain", "river", "leaf", "ocean", "lake"],
  },
  {
    type: "emotional_landscape",
    hints: ["landscape", "sunset", "sunrise", "sea", "sky", "field", "silence"],
  },
];

function resolvePhotoStyleTypeHint(originalName: string): PhotoStyleType | null {
  const normalized = normalizeSeedSource(originalName);

  for (const candidate of photoStyleTypeHints) {
    if (candidate.hints.some((hint) => normalized.includes(hint))) {
      return candidate.type;
    }
  }

  return null;
}

export function resolvePresetForPhotoStyle(
  messages: MockAnalysisMessages,
  photoStyleType: PhotoStyleType,
  seed: number,
): MockPreset {
  const candidates = messages.presets.filter((preset) => {
    const basis = preset.file_hints[0] ?? preset.scene_type;
    return resolvePhotoStyleType(preset, basis) === photoStyleType;
  });

  if (candidates.length > 0) {
    return candidates[seed % candidates.length];
  }

  return messages.presets[seed % messages.presets.length];
}

export function resolvePhotoStyleType(preset: MockPreset, originalName: string): PhotoStyleType {
  const hintedType = resolvePhotoStyleTypeHint(originalName);

  if (hintedType) {
    return hintedType;
  }

  return preset.photo_style_type ?? "other";
}

export function buildPhraseCandidates(
  preset: MockPreset,
  seed: number,
  photoStyleType: PhotoStyleType,
): PhraseCandidate[] {
  return resolvePhraseEngineStrategy(photoStyleType).buildCandidates({
    preset,
    seed,
  });
}

export function buildPhrases(
  preset: MockPreset,
  seed: number,
  photoStyleType: PhotoStyleType,
): string[] {
  return buildPhraseCandidates(preset, seed, photoStyleType).map((item) => item.phrase);
}

export function buildCaptions(
  preset: MockPreset,
  seed: number,
  photoStyleType: PhotoStyleType,
): string[] {
  if (photoStyleType === "action_speed" || photoStyleType === "sports_energy") {
    const messages = getActionSpeedCopyMessages();
    const hooks = takeRotated(messages.captionSets.hook, 5, seed);
    const bodies = takeRotated(messages.captionSets.body, 5, seed + 1);
    const closes = takeRotated(messages.captionSets.close, 5, seed + 2);

    return uniqueByOrder(
      Array.from({ length: 8 }, (_, index) =>
        [hooks[index % hooks.length], bodies[index % bodies.length], closes[index % closes.length]]
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n"),
      ),
    ).slice(0, 5);
  }

  const emotions = takeRotated(preset.caption_sets.emotion, 5, seed);
  const expansions = takeRotated(preset.caption_sets.expansion, 5, seed + 1);
  const pauses = takeRotated(preset.caption_sets.pause, 5, seed + 2);

  const captions = uniqueByOrder(
    Array.from({ length: 9 }, (_, index) => {
      const emotion = emotions[index % emotions.length];
      const expansion = expansions[(index * 2 + seed) % expansions.length];
      const pause = pauses[(index * 3 + seed + 1) % pauses.length];

      return [emotion, expansion, pause]
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join("\n");
    }),
  );

  return captions.slice(0, 5);
}

export function resolveAnalysisMetadata(
  preset: MockPreset,
  photoStyleType: PhotoStyleType,
  seed: number,
): ResolvedAnalysisMetadata {
  if (photoStyleType === "action_speed" || photoStyleType === "sports_energy") {
    const messages = getActionSpeedCopyMessages();
    const hooks = takeRotated(messages.captionSets.hook, 5, seed);
    const bodies = takeRotated(messages.captionSets.body, 5, seed + 1);
    const closes = takeRotated(messages.captionSets.close, 5, seed + 2);
    const actionPhrases = uniqueByOrder([
      ...messages.phraseSets.empathy,
      ...messages.phraseSets.comfort,
      ...messages.phraseSets.question,
    ]);
    const sceneType = photoStyleType === "sports_energy" ? "sports_energy" : "drift_speed";
    const moodCategory =
      photoStyleType === "sports_energy" ? "competitive_focus" : "speed_control";

    return {
      sceneType,
      moodCategory,
      shortReview: hooks[0] ?? actionPhrases[0] ?? preset.short_review,
      longReview: bodies[0] ?? actionPhrases[1] ?? preset.long_review,
      recommendedTextPosition:
        photoStyleType === "sports_energy" ? "top-center" : "top-left",
      wallpaperScore: photoStyleType === "sports_energy" ? 76 : 82,
      socialScore: photoStyleType === "sports_energy" ? 90 : 94,
      commercialScore: photoStyleType === "sports_energy" ? 88 : 92,
      hashtags: uniqueByOrder([
        ...(photoStyleType === "sports_energy"
          ? [
              "#스포츠에너지",
              "#집중력",
              "#승부욕",
              "#속도감",
              "#퍼포먼스",
              "#스포츠무드",
              "#순간집중",
              "#강한장면",
              "#현장에너지",
              "#움직임",
            ]
          : [
              "#드리프트",
              "#레이싱감성",
              "#모터스포츠",
              "#속도감",
              "#드리프트카",
              "#레이스트랙",
              "#가속의맛",
              "#연기맛집",
              "#제어의쾌감",
              "#압도적장면",
            ]),
      ]).slice(0, 10),
    };
  }

  return {
    sceneType: preset.scene_type,
    moodCategory: preset.mood_category,
    shortReview: preset.short_review,
    longReview: preset.long_review,
    recommendedTextPosition: preset.recommended_text_position,
    wallpaperScore: preset.wallpaper_score,
    socialScore: preset.social_score,
    commercialScore: preset.commercial_score,
    hashtags: preset.hashtags,
  };
}

function normalizePhraseForComparison(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function buildLooseSignature(value: string): string {
  return normalizePhraseForComparison(value)
    .replace(/[?!.,~]/g, "")
    .replace(/\s+/g, "");
}

function buildLeadingSignature(value: string): string {
  return normalizePhraseForComparison(value).replace(/[?!.,~]/g, "").slice(0, 8);
}

function buildTrailingSignature(value: string): string {
  const normalized = normalizePhraseForComparison(value).replace(/[?!.,~]/g, "");
  return normalized.slice(Math.max(0, normalized.length - 8));
}

function calculateTokenOverlap(left: string, right: string): number {
  const leftTokens = left.split(" ").filter(Boolean);
  const rightTokens = right.split(" ").filter(Boolean);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return 0;
  }

  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);
  let overlap = 0;

  leftSet.forEach((token) => {
    if (rightSet.has(token)) {
      overlap += 1;
    }
  });

  return overlap / Math.max(leftSet.size, rightSet.size);
}

function isTooSimilarCandidate(candidate: string, selected: string[]): boolean {
  const candidateNormalized = normalizePhraseForComparison(candidate);
  const candidateSignature = buildLooseSignature(candidate);

  return selected.some((item) => {
    const itemNormalized = normalizePhraseForComparison(item);
    const itemSignature = buildLooseSignature(item);

    if (candidateNormalized === itemNormalized || candidateSignature === itemSignature) {
      return true;
    }

    if (
      candidateSignature.includes(itemSignature) ||
      itemSignature.includes(candidateSignature)
    ) {
      return Math.abs(candidateSignature.length - itemSignature.length) <= 8;
    }

    return calculateTokenOverlap(candidateNormalized, itemNormalized) >= 0.75;
  });
}

function hasTooMuchStructuralRepetition(candidate: string, selected: string[]): boolean {
  const leading = buildLeadingSignature(candidate);
  const trailing = buildTrailingSignature(candidate);
  const similarLeading = selected.filter((item) => buildLeadingSignature(item) === leading).length;
  const similarTrailing = selected.filter((item) => buildTrailingSignature(item) === trailing).length;

  return (leading.length >= 5 && similarLeading >= 1) || (trailing.length >= 5 && similarTrailing >= 1);
}

function normalizePhraseKind(
  candidate: string | PhraseCandidate,
  messages: MockAnalysisMessages["scoring"],
): PhraseKind {
  if (typeof candidate === "object") {
    return candidate.kind;
  }

  if (candidate.includes("?")) {
    return "question";
  }

  if (messages.keywords.empathy.some((keyword) => candidate.includes(keyword))) {
    return "empathy";
  }

  return "comfort";
}

function filterPhraseCandidateEntries(
  candidates: PhraseCandidate[],
  messages: MockAnalysisMessages["scoring"],
  photoStyleType?: PhotoStyleType,
): PhraseCandidate[] {
  const accepted: PhraseCandidate[] = [];
  const isActionLike =
    photoStyleType === "action_speed" || photoStyleType === "sports_energy";

  for (const candidate of candidates) {
    const trimmed = candidate.phrase.trim();
    const charLength = trimmed.replace(/\s+/g, "").length;
    const lineCount = trimmed.split("\n").map((line) => line.trim()).filter(Boolean).length;
  const includesEmotionSignal =
      trimmed.includes("?") ||
      messages.keywords.emotion.some((keyword) => trimmed.includes(keyword)) ||
      messages.keywords.empathy.some((keyword) => trimmed.includes(keyword)) ||
      (messages.keywords.action ?? []).some((keyword) => trimmed.includes(keyword));

    if (!trimmed || lineCount === 0 || lineCount > 2) {
      continue;
    }

    if (charLength < 8 || charLength > 30) {
      continue;
    }

    if (!includesEmotionSignal) {
      continue;
    }

    if (isActionLike && shouldRejectActionLikePhrase(trimmed)) {
      continue;
    }

    if (isTooSimilarCandidate(trimmed, accepted.map((item) => item.phrase))) {
      continue;
    }

    if (hasTooMuchStructuralRepetition(trimmed, accepted.map((item) => item.phrase))) {
      continue;
    }

    accepted.push({
      phrase: trimmed,
      kind: candidate.kind,
    });
  }

  return accepted;
}

function filterCaptionCandidates(captions: string[]): string[] {
  const accepted: string[] = [];

  for (const caption of uniqueByOrder(captions)) {
    const normalized = caption
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join("\n");
    const charLength = normalized.replace(/\s+/g, "").length;
    const lineCount = normalized.split("\n").filter(Boolean).length;

    if (!normalized || lineCount < 2 || lineCount > 4 || charLength < 16 || charLength > 72) {
      continue;
    }

    if (isTooSimilarCandidate(normalized, accepted)) {
      continue;
    }

    accepted.push(normalized);
  }

  return accepted;
}

function filterCaptionCandidatesByStyle(
  captions: string[],
  photoStyleType?: PhotoStyleType,
): string[] {
  const filtered = filterCaptionCandidates(captions);
  const isActionLike =
    photoStyleType === "action_speed" || photoStyleType === "sports_energy";

  if (!isActionLike) {
    return filtered;
  }

  return filtered.filter((caption) => !shouldRejectActionLikeCaption(caption));
}

function shouldRejectActionLikePhrase(phrase: string): boolean {
  const bannedIncludes = [
    "괜찮아",
    "버텨",
    "생각나는 밤",
    "조용한 밤",
    "고요",
    "외로",
    "위로",
    "새벽",
    "그리움",
    "쓸쓸",
    "밤을",
  ];
  const bannedDescriptionPatterns = [/사진/i, /장면/i, /보인다/i, /느껴진다/i, /설명/i];
  const awkwardPatterns = [
    /되어진/,
    /하게 된다$/,
    /수 있다$/,
    /듯하다$/,
    /이어진다$/,
    /하게 만든다$/,
  ];

  if (bannedIncludes.some((token) => phrase.includes(token))) {
    return true;
  }

  if (bannedDescriptionPatterns.some((pattern) => pattern.test(phrase))) {
    return true;
  }

  if (awkwardPatterns.some((pattern) => pattern.test(phrase))) {
    return true;
  }

  return false;
}

function shouldRejectActionLikeCaption(caption: string): boolean {
  const bannedIncludes = [
    "괜찮아",
    "버텨",
    "생각나는 밤",
    "조용한 밤",
    "고요",
    "외로",
    "위로",
    "새벽",
    "그리움",
    "쓸쓸",
  ];
  const bannedDescriptionPatterns = [/사진/i, /장면/i, /보인다/i, /느껴진다/i, /설명/i];
  const awkwardPatterns = [/되어진/, /수 있다$/, /듯하다$/, /하게 만든다$/];

  if (bannedIncludes.some((token) => caption.includes(token))) {
    return true;
  }

  if (bannedDescriptionPatterns.some((pattern) => pattern.test(caption))) {
    return true;
  }

  if (awkwardPatterns.some((pattern) => pattern.test(caption))) {
    return true;
  }

  return false;
}

function scorePhrase(
  phrase: string,
  kind: PhraseKind,
  allPhrases: string[],
  messages: MockAnalysisMessages["scoring"],
  photoStyleType?: PhotoStyleType,
): ScoredPhrase {
  const normalized = normalizePhraseForComparison(phrase);
  const charLength = phrase.replace(/\s+/g, "").length;
  const emotionKeywords = messages.keywords.emotion;
  const empathyKeywords = messages.keywords.empathy;
  const actionKeywords = messages.keywords.action ?? [];
  const profile = resolvePhraseScoringProfile(photoStyleType);
  const tokenCount = phrase.split(/\s+/).filter(Boolean).length;
  const hasQuestion = phrase.includes("?");
  const hasEmotionKeyword = emotionKeywords.some((keyword) => phrase.includes(keyword));
  const hasEmpathyKeyword = empathyKeywords.some((keyword) => phrase.includes(keyword));
  const hasActionKeyword = actionKeywords.some((keyword) => phrase.includes(keyword));
  const hasRealisticLength = charLength >= 8 && charLength <= 22;
  const hasTightRhythm = tokenCount <= 5;
  const isActionLike =
    photoStyleType === "action_speed" || photoStyleType === "sports_energy";
  const isTravelLike = photoStyleType === "travel_korean";
  const isEmotionalLike = !isActionLike && !isTravelLike;

  let emotionScore = profile.emotionBase;
  let empathyScore = profile.empathyBase;
  let conciseScore = profile.conciseBase;
  let repetitionPenalty = 0;
  let kindBonus = 0;
  let resonanceScore = 0;
  let saveabilityScore = 0;
  let impactScore = 0;
  let rhythmScore = 0;
  let intensityScore = 0;
  let realismScore = 0;

  if (hasEmotionKeyword) {
    emotionScore += profile.emotionKeywordBonus;
  }

  if (hasActionKeyword) {
    emotionScore += profile.actionKeywordBonus;
    intensityScore += profile.intensityBonus;
  }

  if (hasQuestion || hasEmpathyKeyword) {
    empathyScore += profile.empathyKeywordBonus;
  }

  if (charLength <= 18) {
    conciseScore += profile.conciseShortBonus;
  } else if (charLength <= 26) {
    conciseScore += profile.conciseMediumBonus;
  } else {
    conciseScore -= profile.conciseLongPenalty;
  }

  if (kind === "question" && hasQuestion) {
    kindBonus += profile.questionKindBonus;
  } else if (kind === "empathy" || kind === "comfort") {
    kindBonus += profile.defaultKindBonus;
  }

  if (isEmotionalLike) {
    if (charLength >= 10 && charLength <= 22) {
      resonanceScore += profile.resonanceBonus;
    }

    if (hasQuestion || charLength <= 18) {
      saveabilityScore += profile.saveabilityBonus;
    }
  }

  if (isActionLike) {
    if (charLength <= 16) {
      impactScore += profile.impactBonus;
    } else if (charLength <= 22) {
      impactScore += Math.round(profile.impactBonus * 0.55);
    }

    if (hasTightRhythm) {
      rhythmScore += profile.rhythmBonus;
    } else if (tokenCount <= 7) {
      rhythmScore += Math.round(profile.rhythmBonus * 0.5);
    }

    if (hasActionKeyword || hasRealisticLength) {
      realismScore += profile.realismBonus;
    }
  }

  if (isTravelLike) {
    if (charLength >= 10 && charLength <= 24) {
      resonanceScore += profile.resonanceBonus;
    }

    if (hasQuestion || charLength <= 20) {
      saveabilityScore += profile.saveabilityBonus;
    }

    if (hasEmotionKeyword || hasEmpathyKeyword) {
      emotionScore += 4;
    }

    if (hasTightRhythm) {
      rhythmScore += profile.rhythmBonus;
    }
  }

  const duplicateCount = allPhrases.filter(
    (item) => normalizePhraseForComparison(item) === normalized,
  ).length;

  if (duplicateCount > 1) {
    repetitionPenalty += 12;
  }

  const firstWord = phrase.split(/[ ,]/).find(Boolean) ?? "";
  const similarStartCount = allPhrases.filter(
    (item) => item !== phrase && item.startsWith(firstWord),
  ).length;

  if (firstWord && similarStartCount >= 2) {
    repetitionPenalty += 6;
  }

  const trailingSignature = buildTrailingSignature(phrase);
  const similarEndingCount = allPhrases.filter(
    (item) => item !== phrase && buildTrailingSignature(item) === trailingSignature,
  ).length;

  if (trailingSignature.length >= 5 && similarEndingCount >= 1) {
    repetitionPenalty += 8;
  }

  const reasonCandidates = [
    { label: messages.reasons.emotion, value: emotionScore },
    { label: messages.reasons.empathy, value: empathyScore },
    {
      label: messages.reasons.concise,
      value:
        conciseScore +
        kindBonus +
        resonanceScore +
        saveabilityScore +
        impactScore +
        rhythmScore +
        intensityScore +
        realismScore,
    },
    { label: messages.reasons.fresh, value: repetitionPenalty === 0 ? profile.freshnessBonus : 0 },
    { label: messages.reasons.repetitive, value: repetitionPenalty > 0 ? repetitionPenalty : 0 },
  ]
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);

  const score = Math.max(
    35,
    Math.min(
      100,
      Math.round(
        emotionScore +
          empathyScore +
          conciseScore +
          kindBonus +
          resonanceScore +
          saveabilityScore +
          impactScore +
          rhythmScore +
          intensityScore +
          realismScore +
          (repetitionPenalty === 0 ? profile.freshnessBonus : 0) -
          repetitionPenalty,
      ),
    ),
  );

  return {
    phrase,
    score,
    reason: reasonCandidates
      .filter((item) => item.label !== messages.reasons.repetitive)
      .slice(0, 2)
      .map((item) => item.label)
      .join(" · "),
  };
}

function scoreCaption(
  caption: string,
  allCaptions: string[],
  messages: MockAnalysisMessages["scoring"],
): ScoredCaption {
  const normalized = normalizePhraseForComparison(caption);
  const lines = caption.split("\n").map((line) => line.trim()).filter(Boolean);
  const charLength = caption.replace(/\s+/g, "").length;
  const emotionKeywords = messages.keywords.emotion;
  const empathyKeywords = messages.keywords.empathy;

  let emotionScore = 18;
  let empathyScore = 18;
  let conciseScore = 14;
  let repetitionPenalty = 0;
  let structureBonus = 0;

  if (emotionKeywords.some((keyword) => caption.includes(keyword))) {
    emotionScore += 14;
  }

  if ((messages.keywords.action ?? []).some((keyword) => caption.includes(keyword))) {
    emotionScore += 16;
    structureBonus += 6;
  }

  if (caption.includes("?") || empathyKeywords.some((keyword) => caption.includes(keyword))) {
    empathyScore += 12;
  }

  if (lines.length >= 2 && lines.length <= 4) {
    structureBonus += 12;
  }

  if (charLength <= 56) {
    conciseScore += 14;
  } else if (charLength <= 68) {
    conciseScore += 8;
  } else {
    conciseScore -= 6;
  }

  const duplicateCount = allCaptions.filter(
    (item) => normalizePhraseForComparison(item) === normalized,
  ).length;

  if (duplicateCount > 1) {
    repetitionPenalty += 12;
  }

  const firstLine = lines[0] ?? "";
  const similarStartCount = allCaptions.filter((item) => {
    if (item === caption) {
      return false;
    }

    const nextFirstLine = item.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
    return firstLine.length > 0 && nextFirstLine.startsWith(firstLine.slice(0, 4));
  }).length;

  if (firstLine && similarStartCount >= 2) {
    repetitionPenalty += 6;
  }

  const reasonCandidates = [
    { label: messages.reasons.emotion, value: emotionScore },
    { label: messages.reasons.empathy, value: empathyScore },
    { label: messages.reasons.concise, value: conciseScore + structureBonus },
    { label: messages.reasons.fresh, value: repetitionPenalty === 0 ? 12 : 0 },
    { label: messages.reasons.repetitive, value: repetitionPenalty > 0 ? repetitionPenalty : 0 },
  ]
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value);

  const score = Math.max(
    35,
    Math.min(
      100,
      Math.round(
        emotionScore +
          empathyScore +
          conciseScore +
          structureBonus +
          (repetitionPenalty === 0 ? 12 : 0) -
          repetitionPenalty,
      ),
    ),
  );

  return {
    caption,
    score,
    reason: reasonCandidates
      .filter((item) => item.label !== messages.reasons.repetitive)
      .slice(0, 2)
      .map((item) => item.label)
      .join(" · "),
  };
}

export function buildScoredPhrases(
  phrases: Array<string | PhraseCandidate>,
  messages: MockAnalysisMessages["scoring"],
  photoStyleType?: PhotoStyleType,
): ScoredPhrase[] {
  const profile = resolvePhraseScoringProfile(photoStyleType);
  const typedCandidates = phrases.map((candidate) => {
    if (typeof candidate === "string") {
      return {
        phrase: candidate,
        kind: normalizePhraseKind(candidate, messages),
      } satisfies PhraseCandidate;
    }

    return {
      phrase: candidate.phrase,
      kind: candidate.kind,
    } satisfies PhraseCandidate;
  });

  const filtered = filterPhraseCandidateEntries(typedCandidates, messages, photoStyleType);
  const allPhrases = filtered.map((item) => item.phrase);
  const scored = filtered
    .map((item) => ({
      ...scorePhrase(item.phrase, item.kind, allPhrases, messages, photoStyleType),
      kind: item.kind,
      topPickPriority: computeTopPickPriority(
        item.phrase,
        item.kind,
        profile,
        photoStyleType,
      ),
    }))
    .sort(
      (left, right) =>
        right.score + right.topPickPriority - (left.score + left.topPickPriority) ||
        right.topPickPriority - left.topPickPriority ||
        left.phrase.localeCompare(right.phrase, "ko"),
    );

  const selected: Array<ScoredPhrase & { kind: PhraseKind; topPickPriority: number }> = [];
  const selectedSet = new Set<string>();
  const selectedCounts: Record<PhraseKind, number> = {
    empathy: 0,
    comfort: 0,
    question: 0,
  };

  (["empathy", "comfort", "question"] as PhraseKind[]).forEach((kind) => {
    scored
      .filter((item) => item.kind === kind)
      .slice(0, profile.quotas[kind])
      .forEach((item) => {
        if (selectedSet.has(item.phrase)) {
          return;
        }

        selected.push(item);
        selectedSet.add(item.phrase);
        selectedCounts[kind] += 1;
      });
  });

  for (const item of scored) {
    if (selected.length >= 10) {
      break;
    }

    if (selectedSet.has(item.phrase)) {
      continue;
    }

    if (selectedCounts[item.kind] >= profile.caps[item.kind]) {
      continue;
    }

    selected.push(item);
    selectedSet.add(item.phrase);
    selectedCounts[item.kind] += 1;
  }

  return selected
    .sort(
      (left, right) =>
        right.score + right.topPickPriority - (left.score + left.topPickPriority) ||
        right.topPickPriority - left.topPickPriority ||
        left.phrase.localeCompare(right.phrase, "ko"),
    )
    .slice(0, 10)
    .map(({ kind: _kind, topPickPriority: _topPickPriority, ...item }) => item);
}

export function buildScoredCaptions(
  captions: string[],
  messages: MockAnalysisMessages["scoring"],
  photoStyleType?: PhotoStyleType,
): ScoredCaption[] {
  const filtered = filterCaptionCandidatesByStyle(captions, photoStyleType);

  return filtered
    .map((caption) => scoreCaption(caption, filtered, messages))
    .sort((left, right) => right.score - left.score || left.caption.localeCompare(right.caption, "ko"));
}

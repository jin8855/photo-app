import koMessages from "@/i18n/messages/ko.json";
import type { ScoredCaption, ScoredPhrase } from "@/lib/types/analysis";

type PhraseKind = "empathy" | "comfort" | "question";

type PhraseCandidate = {
  phrase: string;
  kind: PhraseKind;
};

export type MockPreset = {
  file_hints: string[];
  scene_type: string;
  mood_category: string;
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

export function getMockMessages(): MockAnalysisMessages {
  return koMessages.analysisMock as MockAnalysisMessages;
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

export function buildPhraseCandidates(preset: MockPreset, seed: number): PhraseCandidate[] {
  const empathy = uniqueByOrder([
    ...takeRotated(preset.phrase_sets.empathy, 6, seed),
    ...buildPatternSentences(preset.phrase_patterns?.empathy, seed, 4),
  ]);
  const comfort = uniqueByOrder([
    ...takeRotated(preset.phrase_sets.comfort, 5, seed + 1),
    ...buildPatternSentences(preset.phrase_patterns?.comfort, seed + 1, 4),
  ]);
  const question = uniqueByOrder([
    ...takeRotated(preset.phrase_sets.question, 5, seed + 2),
    ...buildPatternSentences(preset.phrase_patterns?.question, seed + 2, 4),
  ]);

  const seededCandidates = [
    ...withKind(takeRotated(empathy, empathy.length, seed), "empathy"),
    ...withKind(takeRotated(comfort, comfort.length, seed + 3), "comfort"),
    ...withKind(takeRotated(question, question.length, seed + 6), "question"),
    ...withKind(takeRotated(empathy, empathy.length, seed + 9), "empathy"),
    ...withKind(takeRotated(comfort, comfort.length, seed + 12), "comfort"),
    ...withKind(takeRotated(question, question.length, seed + 15), "question"),
  ];

  const seen = new Set<string>();
  const result: PhraseCandidate[] = [];

  for (const item of seededCandidates) {
    const normalized = item.phrase.trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push({
      phrase: normalized,
      kind: item.kind,
    });
  }

  return result;
}

export function buildPhrases(preset: MockPreset, seed: number): string[] {
  return buildPhraseCandidates(preset, seed).map((item) => item.phrase);
}

export function buildCaptions(preset: MockPreset, seed: number): string[] {
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
): PhraseCandidate[] {
  const accepted: PhraseCandidate[] = [];

  for (const candidate of candidates) {
    const trimmed = candidate.phrase.trim();
    const charLength = trimmed.replace(/\s+/g, "").length;
    const lineCount = trimmed.split("\n").map((line) => line.trim()).filter(Boolean).length;
    const includesEmotionSignal =
      trimmed.includes("?") ||
      messages.keywords.emotion.some((keyword) => trimmed.includes(keyword)) ||
      messages.keywords.empathy.some((keyword) => trimmed.includes(keyword));

    if (!trimmed || lineCount === 0 || lineCount > 2) {
      continue;
    }

    if (charLength < 8 || charLength > 30) {
      continue;
    }

    if (!includesEmotionSignal) {
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

function scorePhrase(
  phrase: string,
  kind: PhraseKind,
  allPhrases: string[],
  messages: MockAnalysisMessages["scoring"],
): ScoredPhrase {
  const normalized = normalizePhraseForComparison(phrase);
  const charLength = phrase.replace(/\s+/g, "").length;
  const emotionKeywords = messages.keywords.emotion;
  const empathyKeywords = messages.keywords.empathy;

  let emotionScore = 18;
  let empathyScore = 18;
  let conciseScore = 16;
  let repetitionPenalty = 0;
  let kindBonus = 0;

  if (emotionKeywords.some((keyword) => phrase.includes(keyword))) {
    emotionScore += 18;
  }

  if (phrase.includes("?") || empathyKeywords.some((keyword) => phrase.includes(keyword))) {
    empathyScore += 16;
  }

  if (charLength <= 22) {
    conciseScore += 18;
  } else if (charLength <= 28) {
    conciseScore += 10;
  } else {
    conciseScore -= 10;
  }

  if (kind === "question" && phrase.includes("?")) {
    kindBonus += 8;
  } else if (kind === "empathy" || kind === "comfort") {
    kindBonus += 6;
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
    { label: messages.reasons.concise, value: conciseScore + kindBonus },
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
          kindBonus +
          (repetitionPenalty === 0 ? 12 : 0) -
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
): ScoredPhrase[] {
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

  const filtered = filterPhraseCandidateEntries(typedCandidates, messages);
  const allPhrases = filtered.map((item) => item.phrase);
  const scored = filtered
    .map((item) => ({
      ...scorePhrase(item.phrase, item.kind, allPhrases, messages),
      kind: item.kind,
    }))
    .sort((left, right) => right.score - left.score || left.phrase.localeCompare(right.phrase, "ko"));

  const selected: Array<ScoredPhrase & { kind: PhraseKind }> = [];
  const selectedSet = new Set<string>();
  const quotas: Record<PhraseKind, number> = {
    empathy: 3,
    comfort: 3,
    question: 3,
  };

  (["empathy", "comfort", "question"] as PhraseKind[]).forEach((kind) => {
    scored
      .filter((item) => item.kind === kind)
      .slice(0, quotas[kind])
      .forEach((item) => {
        if (selectedSet.has(item.phrase)) {
          return;
        }

        selected.push(item);
        selectedSet.add(item.phrase);
      });
  });

  for (const item of scored) {
    if (selected.length >= 10) {
      break;
    }

    if (selectedSet.has(item.phrase)) {
      continue;
    }

    selected.push(item);
    selectedSet.add(item.phrase);
  }

  return selected
    .sort((left, right) => right.score - left.score || left.phrase.localeCompare(right.phrase, "ko"))
    .slice(0, 10)
    .map(({ kind: _kind, ...item }) => item);
}

export function buildScoredCaptions(
  captions: string[],
  messages: MockAnalysisMessages["scoring"],
): ScoredCaption[] {
  const filtered = filterCaptionCandidates(captions);

  return filtered
    .map((caption) => scoreCaption(caption, filtered, messages))
    .sort((left, right) => right.score - left.score || left.caption.localeCompare(right.caption, "ko"));
}

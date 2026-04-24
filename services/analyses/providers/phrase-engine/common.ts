import type { PhraseCandidate, PhraseKind } from "@/services/analyses/providers/phrase-engine/types";
import type { MockPreset } from "@/services/analyses/providers/analysis-preset";

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

export function takeRotated(items: string[], count: number, offset: number): string[] {
  if (items.length === 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => items[(offset + index) % items.length]);
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
    return `${pattern.starts[pairIndex]}${pattern.ends[pairIndex]}`;
  });
}

export function withKind(items: string[], kind: PhraseKind): PhraseCandidate[] {
  return items
    .map((phrase) => phrase.trim())
    .filter(Boolean)
    .map((phrase) => ({ phrase, kind }));
}

export function buildPhrasePool(
  preset: MockPreset,
  kind: PhraseKind,
  seed: number,
  rotateCount: number,
  patternCount: number,
): string[] {
  const set = preset.phrase_sets[kind];
  const pattern = preset.phrase_patterns?.[kind];

  return uniqueByOrder([
    ...takeRotated(set, Math.min(set.length, rotateCount), seed),
    ...buildPatternSentences(pattern, seed, patternCount),
  ]);
}

export function sortByLengthAscending(candidates: PhraseCandidate[]): PhraseCandidate[] {
  return [...candidates].sort((left, right) => {
    const leftLength = left.phrase.replace(/\s+/g, "").length;
    const rightLength = right.phrase.replace(/\s+/g, "").length;
    return leftLength - rightLength || left.phrase.localeCompare(right.phrase, "ko");
  });
}

export function dedupeCandidates(candidates: PhraseCandidate[]): PhraseCandidate[] {
  const seen = new Set<string>();
  const result: PhraseCandidate[] = [];

  for (const candidate of candidates) {
    const normalized = candidate.phrase.trim();

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push({
      phrase: normalized,
      kind: candidate.kind,
    });
  }

  return result;
}

export function mergeKindBlocks(blocks: PhraseCandidate[][]): PhraseCandidate[] {
  return dedupeCandidates(blocks.flat());
}

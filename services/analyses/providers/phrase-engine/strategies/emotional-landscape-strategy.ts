import {
  buildPhrasePool,
  mergeKindBlocks,
  takeRotated,
  withKind,
} from "@/services/analyses/providers/phrase-engine/common";
import type {
  PhraseEngineStrategy,
  PhraseEngineStrategyContext,
} from "@/services/analyses/providers/phrase-engine/types";

export class EmotionalLandscapePhraseStrategy implements PhraseEngineStrategy {
  buildCandidates({ preset, seed }: PhraseEngineStrategyContext) {
    const empathy = buildPhrasePool(preset, "empathy", seed, 6, 4);
    const comfort = buildPhrasePool(preset, "comfort", seed + 1, 5, 4);
    const question = buildPhrasePool(preset, "question", seed + 2, 5, 4);

    return mergeKindBlocks([
      withKind(takeRotated(empathy, empathy.length, seed), "empathy"),
      withKind(takeRotated(comfort, comfort.length, seed + 3), "comfort"),
      withKind(takeRotated(question, question.length, seed + 6), "question"),
      withKind(takeRotated(empathy, empathy.length, seed + 9), "empathy"),
    ]);
  }
}

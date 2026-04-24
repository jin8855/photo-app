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

export class HealingPhraseStrategy implements PhraseEngineStrategy {
  buildCandidates({ preset, seed }: PhraseEngineStrategyContext) {
    const empathy = buildPhrasePool(preset, "empathy", seed, 5, 2);
    const comfort = buildPhrasePool(preset, "comfort", seed + 1, 6, 4);
    const question = buildPhrasePool(preset, "question", seed + 2, 4, 2);

    return mergeKindBlocks([
      withKind(takeRotated(comfort, comfort.length, seed), "comfort"),
      withKind(takeRotated(empathy, empathy.length, seed + 2), "empathy"),
      withKind(takeRotated(comfort, comfort.length, seed + 4), "comfort"),
      withKind(takeRotated(question, question.length, seed + 6), "question"),
    ]);
  }
}

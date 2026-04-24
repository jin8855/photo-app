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

export class TravelPhraseStrategy implements PhraseEngineStrategy {
  buildCandidates({ preset, seed }: PhraseEngineStrategyContext) {
    const empathy = buildPhrasePool(preset, "empathy", seed, 6, 3);
    const comfort = buildPhrasePool(preset, "comfort", seed + 1, 4, 2);
    const question = buildPhrasePool(preset, "question", seed + 2, 5, 3);

    return mergeKindBlocks([
      withKind(takeRotated(empathy, empathy.length, seed), "empathy"),
      withKind(takeRotated(question, question.length, seed + 2), "question"),
      withKind(takeRotated(empathy, empathy.length, seed + 4), "empathy"),
      withKind(takeRotated(comfort, comfort.length, seed + 7), "comfort"),
    ]);
  }
}

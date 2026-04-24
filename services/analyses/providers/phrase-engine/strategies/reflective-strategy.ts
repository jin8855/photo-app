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

export class ReflectivePhraseStrategy implements PhraseEngineStrategy {
  buildCandidates({ preset, seed }: PhraseEngineStrategyContext) {
    const empathy = buildPhrasePool(preset, "empathy", seed, 4, 3);
    const comfort = buildPhrasePool(preset, "comfort", seed + 1, 4, 2);
    const question = buildPhrasePool(preset, "question", seed + 2, 6, 4);

    return mergeKindBlocks([
      withKind(takeRotated(question, question.length, seed), "question"),
      withKind(takeRotated(empathy, empathy.length, seed + 2), "empathy"),
      withKind(takeRotated(question, question.length, seed + 5), "question"),
      withKind(takeRotated(comfort, comfort.length, seed + 8), "comfort"),
    ]);
  }
}

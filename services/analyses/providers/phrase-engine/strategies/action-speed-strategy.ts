import {
  dedupeCandidates,
  mergeKindBlocks,
  sortByLengthAscending,
  takeRotated,
  withKind,
} from "@/services/analyses/providers/phrase-engine/common";
import { getActionSpeedCopyMessages } from "@/services/analyses/providers/phrase-engine/action-speed-copy";
import type {
  PhraseEngineStrategy,
  PhraseEngineStrategyContext,
} from "@/services/analyses/providers/phrase-engine/types";

export class ActionSpeedPhraseStrategy implements PhraseEngineStrategy {
  buildCandidates({ seed }: PhraseEngineStrategyContext) {
    const messages = getActionSpeedCopyMessages();
    const empathy = takeRotated(messages.phraseSets.empathy, messages.phraseSets.empathy.length, seed);
    const comfort = takeRotated(
      messages.phraseSets.comfort,
      messages.phraseSets.comfort.length,
      seed + 1,
    );
    const question = takeRotated(
      messages.phraseSets.question,
      messages.phraseSets.question.length,
      seed + 2,
    );
    const patterns = Array.from({ length: Math.min(messages.phrasePatterns.starts.length, messages.phrasePatterns.ends.length) }, (_, index) => {
      const start = messages.phrasePatterns.starts[(seed + index) % messages.phrasePatterns.starts.length];
      const end = messages.phrasePatterns.ends[(seed + index) % messages.phrasePatterns.ends.length];
      return `${start}${end}`;
    });

    return dedupeCandidates(
      mergeKindBlocks([
      sortByLengthAscending(withKind(takeRotated(empathy, empathy.length, seed), "empathy")),
      sortByLengthAscending(withKind(takeRotated(question, question.length, seed + 2), "question")),
      sortByLengthAscending(withKind(patterns, "empathy")),
      sortByLengthAscending(withKind(takeRotated(empathy, empathy.length, seed + 5), "empathy")),
      sortByLengthAscending(withKind(takeRotated(comfort, comfort.length, seed + 7), "comfort")),
      ]),
    );
  }
}

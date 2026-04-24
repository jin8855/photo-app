import type { MockPreset } from "@/services/analyses/providers/analysis-preset";

export type PhraseKind = "empathy" | "comfort" | "question";

export type PhraseCandidate = {
  phrase: string;
  kind: PhraseKind;
};

export type PhraseEngineStrategyContext = {
  preset: MockPreset;
  seed: number;
};

export interface PhraseEngineStrategy {
  buildCandidates(context: PhraseEngineStrategyContext): PhraseCandidate[];
}

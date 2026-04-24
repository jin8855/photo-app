import type { PhotoStyleType } from "@/lib/types/analysis";
import type { PhraseEngineStrategy } from "@/services/analyses/providers/phrase-engine/types";
import { ActionSpeedPhraseStrategy } from "@/services/analyses/providers/phrase-engine/strategies/action-speed-strategy";
import { EmotionalLandscapePhraseStrategy } from "@/services/analyses/providers/phrase-engine/strategies/emotional-landscape-strategy";
import { HealingPhraseStrategy } from "@/services/analyses/providers/phrase-engine/strategies/healing-strategy";
import { ReflectivePhraseStrategy } from "@/services/analyses/providers/phrase-engine/strategies/reflective-strategy";
import { TravelPhraseStrategy } from "@/services/analyses/providers/phrase-engine/strategies/travel-strategy";

const emotionalStrategy = new EmotionalLandscapePhraseStrategy();
const healingStrategy = new HealingPhraseStrategy();
const reflectiveStrategy = new ReflectivePhraseStrategy();
const actionSpeedStrategy = new ActionSpeedPhraseStrategy();
const travelStrategy = new TravelPhraseStrategy();

export function resolvePhraseEngineStrategy(photoStyleType: PhotoStyleType): PhraseEngineStrategy {
  switch (photoStyleType) {
    case "spring_healing":
    case "natural_healing":
      return healingStrategy;
    case "reflective_fog":
      return reflectiveStrategy;
    case "action_speed":
    case "sports_energy":
      return actionSpeedStrategy;
    case "travel_korean":
      return travelStrategy;
    case "emotional_landscape":
    case "lonely_night":
    case "urban_mood":
    case "other":
    default:
      return emotionalStrategy;
  }
}

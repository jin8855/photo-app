import type { FeatureFlagMap, PlanDefinition } from "@/lib/types/access";
import { getDefaultFeatureFlags } from "@/resources/config/access";

export class FeatureFlagService {
  getFlagsForPlan(plan: PlanDefinition): FeatureFlagMap {
    const flags = getDefaultFeatureFlags();

    for (const featureKey of plan.enabledFeatures) {
      flags[featureKey] = true;
    }

    return flags;
  }
}

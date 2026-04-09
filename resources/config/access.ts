import type { AppPlanKey, FeatureFlagMap, PlanDefinition } from "@/lib/types/access";

const PLAN_DEFINITIONS: Record<AppPlanKey, PlanDefinition> = {
  free: {
    key: "free",
    premium: false,
    usageLimits: [
      {
        metric: "dailyAnalysis",
        limit: 20,
      },
    ],
    enabledFeatures: [],
  },
  premium: {
    key: "premium",
    premium: true,
    usageLimits: [
      {
        metric: "dailyAnalysis",
        limit: null,
      },
    ],
    enabledFeatures: [
      "premiumAnalysis",
      "premiumCommerce",
      "premiumContentSet",
      "premiumStoreConnect",
    ],
  },
};

const DEFAULT_FEATURE_FLAGS: FeatureFlagMap = {
  premiumAnalysis: false,
  premiumCommerce: false,
  premiumContentSet: false,
  premiumStoreConnect: false,
};

export function getPlanDefinition(planKey: AppPlanKey): PlanDefinition {
  return PLAN_DEFINITIONS[planKey];
}

export function getDefaultFeatureFlags(): FeatureFlagMap {
  return { ...DEFAULT_FEATURE_FLAGS };
}

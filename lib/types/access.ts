export type AppPlanKey = "free" | "premium";

export type PremiumFeatureKey =
  | "premiumAnalysis"
  | "premiumCommerce"
  | "premiumContentSet"
  | "premiumStoreConnect";

export type UsageMetricKey = "dailyAnalysis";

export type UsageLimitPolicy = {
  metric: UsageMetricKey;
  limit: number | null;
};

export type PlanDefinition = {
  key: AppPlanKey;
  premium: boolean;
  usageLimits: UsageLimitPolicy[];
  enabledFeatures: PremiumFeatureKey[];
};

export type FeatureFlagMap = Record<PremiumFeatureKey, boolean>;

export type UsagePolicyMap = Record<UsageMetricKey, number | null>;

export type UserAccessSnapshot = {
  planKey: AppPlanKey;
  premium: boolean;
  featureFlags: FeatureFlagMap;
  usagePolicies: UsagePolicyMap;
};

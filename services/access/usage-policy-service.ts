import type { PlanDefinition, UsagePolicyMap } from "@/lib/types/access";

const EMPTY_USAGE_POLICIES: UsagePolicyMap = {
  dailyAnalysis: null,
};

export class UsagePolicyService {
  getPoliciesForPlan(plan: PlanDefinition): UsagePolicyMap {
    const nextPolicies: UsagePolicyMap = {
      ...EMPTY_USAGE_POLICIES,
    };

    for (const usageLimit of plan.usageLimits) {
      nextPolicies[usageLimit.metric] = usageLimit.limit;
    }

    return nextPolicies;
  }
}

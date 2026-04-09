import type { UserAccessSnapshot } from "@/lib/types/access";
import type { UserContext } from "@/lib/types/user-context";
import { FeatureFlagService } from "@/services/access/feature-flag-service";
import { PlanService } from "@/services/access/plan-service";
import { UsagePolicyService } from "@/services/access/usage-policy-service";

export class AccessControlService {
  constructor(
    private readonly planService: PlanService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly usagePolicyService: UsagePolicyService,
  ) {}

  getAccessSnapshot(userContext: UserContext): UserAccessSnapshot {
    const plan = this.planService.getPlanForUser(userContext);

    return {
      planKey: plan.key,
      premium: plan.premium,
      featureFlags: this.featureFlagService.getFlagsForPlan(plan),
      usagePolicies: this.usagePolicyService.getPoliciesForPlan(plan),
    };
  }
}

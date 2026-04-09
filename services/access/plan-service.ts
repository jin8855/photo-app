import type { PlanDefinition } from "@/lib/types/access";
import type { UserContext } from "@/lib/types/user-context";
import { getPlanDefinition } from "@/resources/config/access";

export class PlanService {
  getPlanForUser(userContext: UserContext): PlanDefinition {
    return getPlanDefinition(userContext.planKey);
  }
}

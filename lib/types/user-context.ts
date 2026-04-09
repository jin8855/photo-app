import type { AppPlanKey } from "@/lib/types/access";

export type UserContext = {
  mode: "guest";
  userId: null;
  scopeKey: "local";
  planKey: AppPlanKey;
};

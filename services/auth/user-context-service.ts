import type { UserContext } from "@/lib/types/user-context";

export function getCurrentUserContext(): UserContext {
  return {
    mode: "guest",
    userId: null,
    scopeKey: "local",
    planKey: "free",
  };
}

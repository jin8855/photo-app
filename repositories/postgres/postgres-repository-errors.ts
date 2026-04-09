import { getPostgresConfig } from "@/resources/config/database";

export function assertPostgresConfigured(): void {
  const config = getPostgresConfig();

  if (!config.url) {
    throw new Error("postgresUrlMissing");
  }
}

export function throwPostgresRepositoryNotImplemented(): never {
  throw new Error("postgresRepositoryNotImplemented");
}

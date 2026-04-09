export function getPostgresConfig() {
  return {
    url: process.env.POSTGRES_URL ?? "",
  };
}

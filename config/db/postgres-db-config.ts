export function getPostgresConfig() {
  return {
    url: (process.env.POSTGRES_URL ?? "").replace(/\\r/g, "").replace(/\\n/g, "").trim(),
  };
}

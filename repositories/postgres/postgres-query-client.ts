import { Pool } from "pg";

import { getPostgresConfig } from "@/resources/config/database";

export type PostgresQueryClient = {
  query: <T = unknown>(sql: string, params?: readonly unknown[]) => Promise<T[]>;
};

let sharedPool: Pool | null = null;

function getSharedPool(): Pool {
  if (sharedPool) {
    return sharedPool;
  }

  const config = getPostgresConfig();
  if (!config.url) {
    throw new Error("postgresUrlMissing");
  }

  sharedPool = new Pool({
    connectionString: config.url,
  });

  return sharedPool;
}

export function createPostgresQueryClient(): PostgresQueryClient {
  const pool = getSharedPool();

  return {
    async query<T = unknown>(sql: string, params: readonly unknown[] = []): Promise<T[]> {
      const result = await pool.query(sql, [...params]);
      return result.rows as T[];
    },
  };
}

import { runSqlCommand } from "@/lib/db/sqlcmd";
import { getLocalMssqlConfig } from "@/resources/config/database";

export interface MssqlQueryRunner {
  run(query: string): string;
}

export class LocalMssqlQueryRunner implements MssqlQueryRunner {
  private readonly config = getLocalMssqlConfig();

  run(query: string): string {
    return runSqlCommand({
      server: this.config.server,
      database: this.config.databaseName,
      query,
    });
  }
}

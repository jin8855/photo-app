type ParsedMssqlConnectionString = {
  server: string;
  databaseName: string;
};

function parseConnectionStringValue(connectionString: string, keys: string[]): string | null {
  const parts = connectionString
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = part.slice(0, separatorIndex).trim().toLowerCase();
    const value = part.slice(separatorIndex + 1).trim();

    if (keys.some((candidate) => candidate.toLowerCase() === key) && value) {
      return value;
    }
  }

  return null;
}

function parseMssqlConnectionString(connectionString: string): ParsedMssqlConnectionString {
  const server =
    parseConnectionStringValue(connectionString, ["server", "data source", "addr", "address"]) ?? "";
  const databaseName =
    parseConnectionStringValue(connectionString, ["database", "initial catalog"]) ?? "";

  if (!server || !databaseName) {
    throw new Error("configInvalid:MSSQL_CONNECTION_STRING");
  }

  return {
    server,
    databaseName,
  };
}

export function getLocalMssqlConfig() {
  const connectionString = process.env.MSSQL_CONNECTION_STRING?.trim();

  if (connectionString) {
    return parseMssqlConnectionString(connectionString);
  }

  return {
    server: process.env.LOCAL_SQLSERVER_INSTANCE ?? "(localdb)\\MSSQLLocalDB",
    databaseName: process.env.LOCAL_SQLSERVER_DB ?? "PhotoCaptionLocalApp",
  };
}

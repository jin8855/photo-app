export function toSqlNvarcharLiteral(value: string): string {
  const hex = Buffer.from(value, "utf16le").toString("hex").toUpperCase();
  return `CONVERT(NVARCHAR(MAX), 0x${hex})`;
}

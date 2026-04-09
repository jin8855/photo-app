import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const koreanDecoder = new TextDecoder("euc-kr");

type SqlCommandOptions = {
  server: string;
  database: string;
  query: string;
};

function normalizeSqlcmdOutput(output: string): string {
  const sanitized = output
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .trim();

  if (!sanitized) {
    return sanitized;
  }

  const lines = sanitized.split(/\r?\n/);

  if (lines[0]?.startsWith("JSON_F52E2B61-18A1-11d1-B105-00805F49916B")) {
    const remainingLines = lines.slice(2).join("").replace(/[\r\n\t]+/g, "").trim();
    return remainingLines;
  }

  return sanitized.replace(/[\r\n\t]+/g, "");
}

export function runSqlCommand({ server, database, query }: SqlCommandOptions): string {
  const tempFilePath = path.join(os.tmpdir(), `photo-caption-sqlcmd-${randomUUID()}.sql`);

  try {
    // sqlcmd reliably preserves Korean text when the input file is UTF-16LE with BOM.
    fs.writeFileSync(tempFilePath, `\uFEFF${query}`, { encoding: "utf16le" });

    const output = execFileSync(
      "sqlcmd",
      [
        "-S",
        server,
        "-d",
        database,
        "-w",
        "65535",
        "-y",
        "0",
        "-Y",
        "0",
        "-f",
        "65001",
        "-i",
        tempFilePath,
      ],
      {
        encoding: "buffer",
        windowsHide: true,
      },
    );

    return normalizeSqlcmdOutput(koreanDecoder.decode(output));
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

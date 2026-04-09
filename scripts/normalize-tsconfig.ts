import fs from "node:fs";
import path from "node:path";

type TsConfigShape = {
  include?: string[];
  exclude?: string[];
};

const targetPath = path.join(process.cwd(), "tsconfig.json");

function normalizeList(values: string[] | undefined, fallback: string[]): string[] {
  const nextValues = values ?? fallback;

  return nextValues.filter(
    (value) => value !== ".next/types/**/*.ts" && value !== ".next/dev/types/**/*.ts",
  );
}

function main(): void {
  const raw = fs.readFileSync(targetPath, "utf8");
  const parsed = JSON.parse(raw) as TsConfigShape & Record<string, unknown>;

  parsed.include = normalizeList(parsed.include, ["next-env.d.ts", "**/*.ts", "**/*.tsx"]);
  parsed.exclude = Array.from(new Set([...(parsed.exclude ?? ["node_modules"]), ".next", "dist", "coverage"]));

  fs.writeFileSync(targetPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
}

main();

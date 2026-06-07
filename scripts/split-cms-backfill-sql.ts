import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Split cms-backfill.sql into per-statement files for MCP execution.
 * Usage: npx tsx scripts/split-cms-backfill-sql.ts
 */
const sqlPath = path.join(process.cwd(), "tmp", "cms-backfill.sql");
const outDir = path.join(process.cwd(), "tmp", "cms-backfill-chunks");

const sql = readFileSync(sqlPath, "utf8");
const chunks = sql.split(/;\s*\n+/).map((chunk) => chunk.trim()).filter(Boolean);

import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync(outDir, { recursive: true });

chunks.forEach((chunk, index) => {
  writeFileSync(path.join(outDir, `${String(index + 1).padStart(3, "0")}.sql`), `${chunk};`);
});

console.log(`Split into ${chunks.length} files in ${outDir}`);

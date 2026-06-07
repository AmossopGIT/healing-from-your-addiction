/**
 * Prints chunk SQL paths for Supabase MCP execute_sql application.
 * Usage: node scripts/mcp-apply-cms-chunks.mjs [start] [end]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "tmp", "cms-backfill-chunks");
const start = Number(process.argv[2] ?? 1);
const end = Number(process.argv[3] ?? 50);

const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

for (const file of files) {
  const num = Number.parseInt(file, 10);
  if (num < start || num > end) continue;
  const sql = fs.readFileSync(path.join(dir, file), "utf8");
  process.stdout.write(`--- ${file} (${sql.length} bytes) ---\n${sql}\n`);
}

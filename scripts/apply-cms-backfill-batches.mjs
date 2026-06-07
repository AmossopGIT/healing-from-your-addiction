/**
 * Reads tmp/cms-backfill-batches/*.sql and prints batch index + byte length.
 * Apply batches via Supabase MCP execute_sql (service role on MCP side).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "tmp", "cms-backfill-batches");

const batchArg = process.argv[2];
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (batchArg === "list") {
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    console.log(`${file}\t${sql.length}`);
  }
  process.exit(0);
}

const file = batchArg ?? files[0];
const sql = fs.readFileSync(path.join(dir, file), "utf8");
process.stdout.write(sql);

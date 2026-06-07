import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const batchDir = path.join(process.cwd(), "tmp", "cms-backfill-batches");
const files = readdirSync(batchDir).filter((file) => file.endsWith(".sql")).sort();

for (const file of files) {
  const sql = readFileSync(path.join(batchDir, file), "utf8");
  console.log(`\n===== ${file} (${sql.length} chars) =====\n`);
  console.log(sql);
}

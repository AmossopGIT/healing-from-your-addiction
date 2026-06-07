import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const chunkDir = path.join(process.cwd(), "tmp", "cms-backfill-chunks");
const batchDir = path.join(process.cwd(), "tmp", "cms-backfill-batches");
const batchSize = 10;

const files = readdirSync(chunkDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

mkdirSync(batchDir, { recursive: true });

for (let i = 0; i < files.length; i += batchSize) {
  const batchFiles = files.slice(i, i + batchSize);
  const sql = batchFiles
    .map((file) => readFileSync(path.join(chunkDir, file), "utf8").replace(/;+\s*$/, ""))
    .join(";\n\n");
  const batchNumber = String(Math.floor(i / batchSize) + 1).padStart(2, "0");
  writeFileSync(path.join(batchDir, `batch-${batchNumber}.sql`), `${sql};`);
}

console.log(`Created ${Math.ceil(files.length / batchSize)} batch files.`);

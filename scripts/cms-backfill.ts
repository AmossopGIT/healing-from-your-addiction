import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { backfillStaticContent } from "@/lib/cms/backfillStaticContent";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  const contents = readFileSync(filePath, "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));

  const forceUpsert = process.argv.includes("--force-upsert");
  const insertMissing = !forceUpsert;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    console.warn("cms:backfill skipped — SUPABASE_SERVICE_ROLE_KEY is not set.");
    process.exit(0);
  }

  try {
    const result = await backfillStaticContent({ insertMissing, actorId: null });
    console.log(
      `CMS backfill complete: blogs inserted ${result.blogInserted}, skipped ${result.blogSkipped}; case studies inserted ${result.caseStudyInserted}, skipped ${result.caseStudySkipped}.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();

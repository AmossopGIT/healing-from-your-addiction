/**
 * Resolve published DB templates for gambling/alcohol/cannabis the same way
 * admin preview and client journey pages do, and assert daily + schedule shape.
 */
import { createClient } from "@supabase/supabase-js";
import { findActivity, getOrderedActivities } from "../lib/programme/interactive/content.ts";
import { generateSessionDates } from "../lib/programme/schedule.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key);
const slugs = ["gambling", "alcohol", "cannabis"] as const;

for (const slug of slugs) {
  const { data: template, error } = await supabase
    .from("programme_templates")
    .select("id, addiction_slug, version, status, content_json, cadence_json, review_status, session_count")
    .eq("addiction_slug", slug)
    .maybeSingle();

  if (error || !template) {
    throw new Error(`${slug}: template missing (${error?.message ?? "null"})`);
  }
  if (template.status !== "published") throw new Error(`${slug}: expected published`);

  const definition = template.content_json as {
    slug: string;
    version: number;
    activities: Array<{ id: string; type: string; origin: string; fields?: Array<{ kind: string; key: string }> }>;
    cadence?: { liveSessionCount?: number };
    dailyCheckIn?: { includeMood?: boolean };
  };

  if (definition.slug !== slug) throw new Error(`${slug}: content slug mismatch`);
  const ordered = getOrderedActivities(definition as never);
  const first = ordered[0];
  if (!first) throw new Error(`${slug}: empty activities`);
  if (!findActivity(definition as never, first.id)) throw new Error(`${slug}: preview lookup failed for ${first.id}`);

  const daily = ordered.find((a) => a.type === "daily_affirmation");
  if (!daily?.fields?.some((f) => f.kind === "mood")) throw new Error(`${slug}: daily mood missing in DB content`);

  const live = Number(
    (template.cadence_json as { liveSessionCount?: number } | null)?.liveSessionCount ??
      definition.cadence?.liveSessionCount ??
      template.session_count ??
      8,
  );
  const dates = generateSessionDates("2026-08-04T09:00:00.000Z", "tue", live);
  if (dates.length !== live) throw new Error(`${slug}: schedule length ${dates.length} != ${live}`);

  const { data: versions } = await supabase
    .from("programme_versions")
    .select("version, status")
    .eq("template_id", template.id)
    .order("version", { ascending: false });

  if (!versions?.length) throw new Error(`${slug}: no programme_versions row`);

  console.log(
    `DB OK ${slug}: published v${template.version} · review=${template.review_status} · activities=${ordered.length} · preview=${first.id} · versions=${versions.length} · live=${live}`,
  );
}

console.log("DB preview/journey resolution smoke passed.");

import { interactiveProgrammes } from "@/content/interactiveProgrammes";
import { assertProgrammesPublishable } from "@/content/interactiveProgrammes/validate";
import { DEFAULT_DAILY_HOMEWORK } from "@/lib/programme/homework";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export async function seedInteractiveProgrammes(options?: { publish?: boolean; slugs?: string[] }) {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false as const, error: "Supabase service role not configured" };
  }

  const publish = options?.publish ?? true;
  const selected = options?.slugs?.length
    ? assertProgrammesPublishable(options.slugs)
    : assertProgrammesPublishable();

  const supabase = createServiceClient();
  let templatesUpserted = 0;
  let homeworkUpserted = 0;

  for (const programme of selected) {
    const reviewApproved = programme.reviewStatus === "approved";
    const shouldPublish = publish && reviewApproved;
    const existing = await supabase
      .from("programme_templates")
      .select("id, version")
      .eq("addiction_slug", programme.slug)
      .maybeSingle();

    const payload = {
      addiction_slug: programme.slug,
      title: programme.title,
      session_count: programme.cadence?.liveSessionCount ?? 8,
      category: programme.category,
      status: shouldPublish ? ("published" as const) : programme.needsManualReview ? ("draft" as const) : ("ready" as const),
      version: programme.version,
      published_at: shouldPublish ? new Date().toISOString() : null,
      description: programme.description,
      safety_json: programme.safety,
      week_count: programme.weekCount,
      day_count: programme.dayCount,
      content_json: programme,
      cadence_json: programme.cadence ?? {},
      source_checksum: programme.sourceChecksum ?? null,
      review_status: programme.reviewStatus ?? (programme.needsManualReview ? "pending" : "pending"),
      source_case_study_slug: null,
    };

    let templateId = existing.data?.id ?? null;

    if (templateId) {
      const { error } = await supabase.from("programme_templates").update(payload).eq("id", templateId);
      if (error) {
        console.error("Interactive programme update failed", programme.slug, error);
        continue;
      }
    } else {
      const { data, error } = await supabase.from("programme_templates").insert(payload).select("id").single();
      if (error || !data) {
        console.error("Interactive programme insert failed", programme.slug, error);
        continue;
      }
      templateId = data.id;
    }

    templatesUpserted += 1;

    await supabase.from("programme_versions").upsert(
      {
        template_id: templateId!,
        version: programme.version,
        status: shouldPublish ? "published" : "draft",
        content_json: programme,
        source_checksum: programme.sourceChecksum ?? null,
        review_status: programme.reviewStatus ?? "pending",
        published_at: shouldPublish ? new Date().toISOString() : null,
      },
      { onConflict: "template_id,version" },
    );

    const homeworkRows = DEFAULT_DAILY_HOMEWORK.map((task) => ({
      template_id: templateId!,
      task_key: task.task_key,
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      week_number: null,
      cadence: "daily" as const,
      points: task.points,
      tone: "standard" as const,
      sort_order: task.sort_order,
    }));

    const { error: homeworkError } = await supabase.from("programme_homework_tasks").upsert(homeworkRows, {
      onConflict: "template_id,task_key",
    });
    if (!homeworkError) homeworkUpserted += homeworkRows.length;
  }

  return {
    ok: true as const,
    templatesUpserted,
    homeworkUpserted,
    totalDefinitions: interactiveProgrammes.length,
    selected: selected.length,
  };
}

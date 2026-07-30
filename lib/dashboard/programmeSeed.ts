import { caseStudies, getCaseStudiesByAddiction, type CaseStudyType } from "@/content/caseStudies";
import { getProgrammeDocModules } from "@/content/programmeDocs/gambling";
import { programmes } from "@/content/programmes";
import { DEFAULT_DAILY_HOMEWORK } from "@/lib/programme/homework";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

type SessionSeed = {
  week_number: number;
  session_number: number;
  title: string;
  content_type: "hypno" | "eft" | "affirmations" | "questions" | "overview";
  content_ref: string;
  sort_order: number;
};

function contentTypeFromCaseStudy(type: CaseStudyType): SessionSeed["content_type"] {
  if (type === "script") return "hypno";
  if (type === "programme") return "overview";
  if (type === "questions") return "questions";
  if (type === "affirmations") return "affirmations";
  return "overview";
}

function findStudy(addictionSlug: string, type: CaseStudyType, slugIncludes?: string) {
  const studies = getCaseStudiesByAddiction(addictionSlug).filter((study) => study.caseStudyType === type);
  if (slugIncludes) {
    return studies.find((study) => study.slug.includes(slugIncludes)) ?? studies[0] ?? null;
  }
  return studies[0] ?? null;
}

/** Gambling pilot: eight real sessions mapped to existing case-study content where available. */
function buildGamblingSessions(): SessionSeed[] {
  const overview = findStudy("gambling", "programme");
  const questions = findStudy("gambling", "questions");
  const hypno = findStudy("gambling", "script", "hypnotherapy");
  const eft = findStudy("gambling", "script", "eft");
  const affirmations = findStudy("gambling", "affirmations");

  const sessions: SessionSeed[] = [
    {
      week_number: 1,
      session_number: 1,
      title: overview?.title ?? "Programme orientation",
      content_type: "overview",
      content_ref: overview?.slug ?? "gambling-disorder-four-week-healing-program",
      sort_order: 0,
    },
    {
      week_number: 1,
      session_number: 2,
      title: questions?.title ?? "Discovery questions",
      content_type: "questions",
      content_ref: questions?.slug ?? "gambling-disorder-questions",
      sort_order: 1,
    },
    {
      week_number: 2,
      session_number: 3,
      title: hypno?.title ?? "Week 2 hypnotherapy",
      content_type: "hypno",
      content_ref: hypno?.slug ?? "gambling-disorder-hypnotherapy-week-one-script",
      sort_order: 2,
    },
    {
      week_number: 2,
      session_number: 4,
      title: eft?.title ?? "EFT tapping practice",
      content_type: "eft",
      content_ref: eft?.slug ?? "gambling-disorder-eft-tapping-script",
      sort_order: 3,
    },
    {
      week_number: 3,
      session_number: 5,
      title: affirmations?.title ?? "Affirmation practice",
      content_type: "affirmations",
      content_ref: affirmations?.slug ?? "gambling-disorder-affirmations",
      sort_order: 4,
    },
    {
      week_number: 3,
      session_number: 6,
      title: "Week 3 integration — urge pattern review",
      content_type: "hypno",
      content_ref: hypno?.slug ?? "gambling-disorder-hypnotherapy-week-one-script",
      sort_order: 5,
    },
    {
      week_number: 4,
      session_number: 7,
      title: "Week 4 consolidation — EFT refresh",
      content_type: "eft",
      content_ref: eft?.slug ?? "gambling-disorder-eft-tapping-script",
      sort_order: 6,
    },
    {
      week_number: 4,
      session_number: 8,
      title: "Week 4 closing — forward rhythm",
      content_type: "affirmations",
      content_ref: affirmations?.slug ?? "gambling-disorder-affirmations",
      sort_order: 7,
    },
  ];

  return sessions;
}

function buildSessionsForAddiction(addictionSlug: string): SessionSeed[] {
  if (addictionSlug === "gambling") {
    return buildGamblingSessions();
  }

  const studies = getCaseStudiesByAddiction(addictionSlug);
  const sessions: SessionSeed[] = [];
  let sortOrder = 0;

  const typeOrder: CaseStudyType[] = ["programme", "questions", "script", "affirmations"];

  for (const type of typeOrder) {
    const matches = studies.filter((study) => study.caseStudyType === type);
    for (const study of matches) {
      const contentType = contentTypeFromCaseStudy(study.caseStudyType);
      const weekNumber = contentType === "overview" || contentType === "questions" ? 1 : 1;
      sessions.push({
        week_number: weekNumber,
        session_number: sortOrder + 1,
        title: study.title,
        content_type: contentType,
        content_ref: study.slug,
        sort_order: sortOrder,
      });
      sortOrder += 1;
    }
  }

  while (sessions.length < 8) {
    const week = Math.floor(sessions.length / 2) + 1;
    const sessionInWeek = (sessions.length % 2) + 1;
    sessions.push({
      week_number: Math.min(week, 4),
      session_number: sessions.length + 1,
      title: `Week ${Math.min(week, 4)} — Session ${sessionInWeek}`,
      content_type: "hypno",
      content_ref: `placeholder-week-${Math.min(week, 4)}-session-${sessionInWeek}`,
      sort_order: sortOrder,
    });
    sortOrder += 1;
  }

  return sessions.slice(0, 8);
}

async function seedHomeworkTasksForTemplate(templateId: string) {
  const supabase = createServiceClient();
  const rows = DEFAULT_DAILY_HOMEWORK.map((task) => ({
    template_id: templateId,
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

  const { error } = await supabase.from("programme_homework_tasks").upsert(rows, {
    onConflict: "template_id,task_key",
  });

  if (error) {
    console.error("Homework seed failed:", error);
    return 0;
  }

  return rows.length;
}

async function seedProgrammeDocsForAddiction(addictionSlug: string) {
  const supabase = createServiceClient();
  const modules = getProgrammeDocModules(addictionSlug);
  if (!modules.length) return 0;

  const rows = modules.map((doc) => ({
    addiction_slug: doc.addictionSlug,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    body_markdown: doc.bodyMarkdown,
    week_number: doc.weekNumber,
    sort_order: doc.sortOrder,
  }));

  const { error } = await supabase.from("programme_docs").upsert(rows, {
    onConflict: "addiction_slug,slug",
  });

  if (error) {
    console.error("Programme docs seed failed:", error);
    return 0;
  }

  return rows.length;
}

async function refreshTemplateSessions(templateId: string, addictionSlug: string) {
  const supabase = createServiceClient();
  const sessionSeeds = buildSessionsForAddiction(addictionSlug);

  const { data: existingSessions } = await supabase
    .from("programme_sessions")
    .select("id")
    .eq("template_id", templateId);

  // Only replace sessions when no enrollments reference them yet, or update in place by sort_order.
  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("template_id", templateId);

  if ((count ?? 0) > 0 && (existingSessions?.length ?? 0) > 0) {
    // Update titles/refs for existing sessions by session_number where possible
    for (const seed of sessionSeeds) {
      await supabase
        .from("programme_sessions")
        .update({
          title: seed.title,
          content_type: seed.content_type,
          content_ref: seed.content_ref,
          week_number: seed.week_number,
          sort_order: seed.sort_order,
        })
        .eq("template_id", templateId)
        .eq("session_number", seed.session_number);
    }
    return sessionSeeds.length;
  }

  if (existingSessions?.length) {
    await supabase.from("programme_sessions").delete().eq("template_id", templateId);
  }

  const { error } = await supabase.from("programme_sessions").insert(
    sessionSeeds.map((session) => ({
      template_id: templateId,
      ...session,
    })),
  );

  if (error) {
    console.error("Session refresh failed:", error);
    return 0;
  }

  return sessionSeeds.length;
}

export async function seedProgrammeTemplates() {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false as const, error: "Supabase service role not configured" };
  }

  const supabase = createServiceClient();
  const addictionSlugsWithContent = [...new Set(caseStudies.map((study) => study.addictionSlug))];

  let templatesCreated = 0;
  let sessionsCreated = 0;
  let homeworkCreated = 0;
  let docsCreated = 0;

  for (const addictionSlug of addictionSlugsWithContent) {
    const programme = programmes.find((item) => item.slug === addictionSlug);
    const programmeStudy = getCaseStudiesByAddiction(addictionSlug).find((study) => study.caseStudyType === "programme");

    const { data: existing } = await supabase
      .from("programme_templates")
      .select("id")
      .eq("addiction_slug", addictionSlug)
      .maybeSingle();

    let templateId = existing?.id ?? null;

    if (!existing) {
      const { data: template, error: templateError } = await supabase
        .from("programme_templates")
        .insert({
          addiction_slug: addictionSlug,
          title: programme?.title ?? programmeStudy?.title ?? `${addictionSlug} programme`,
          session_count: 8,
          source_case_study_slug: programmeStudy?.slug ?? null,
        })
        .select("id")
        .single();

      if (templateError || !template) {
        console.error("Template seed failed:", templateError);
        continue;
      }

      templatesCreated += 1;
      templateId = template.id;
    }

    if (!templateId) continue;

    // Always refresh gambling pilot content; create sessions for new templates
    if (addictionSlug === "gambling" || !existing) {
      sessionsCreated += await refreshTemplateSessions(templateId, addictionSlug);
    }

    homeworkCreated += await seedHomeworkTasksForTemplate(templateId);
    docsCreated += await seedProgrammeDocsForAddiction(addictionSlug);
  }

  return {
    ok: true as const,
    templatesCreated,
    sessionsCreated,
    homeworkCreated,
    docsCreated,
  };
}

export function getCaseStudyContent(slug: string) {
  return caseStudies.find((study) => study.slug === slug) ?? null;
}

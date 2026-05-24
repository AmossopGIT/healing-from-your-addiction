import { caseStudies, getCaseStudiesByAddiction, type CaseStudyType } from "@/content/caseStudies";
import { programmes } from "@/content/programmes";
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

function buildSessionsForAddiction(addictionSlug: string): SessionSeed[] {
  const studies = getCaseStudiesByAddiction(addictionSlug);
  const sessions: SessionSeed[] = [];
  let sortOrder = 0;

  const typeOrder: CaseStudyType[] = ["programme", "questions", "script", "affirmations"];

  for (const type of typeOrder) {
    const matches = studies.filter((study) => study.caseStudyType === type);
    for (const study of matches) {
      const contentType = contentTypeFromCaseStudy(study.caseStudyType);
      const weekNumber = contentType === "overview" || contentType === "questions" ? 0 : 1;
      const sessionNumber =
        contentType === "overview" ? 0 : contentType === "questions" ? 0 : sortOrder + 1;

      sessions.push({
        week_number: weekNumber,
        session_number: sessionNumber,
        title: study.title,
        content_type: contentType,
        content_ref: study.slug,
        sort_order: sortOrder,
      });
      sortOrder += 1;
    }
  }

  for (let week = 2; week <= 4; week += 1) {
    for (let sessionInWeek = 1; sessionInWeek <= 2; sessionInWeek += 1) {
      const sessionNumber = (week - 1) * 2 + sessionInWeek;
      sessions.push({
        week_number: week,
        session_number: sessionNumber,
        title: `Week ${week} — Session ${sessionInWeek}`,
        content_type: "hypno",
        content_ref: `placeholder-week-${week}-session-${sessionInWeek}`,
        sort_order: sortOrder,
      });
      sortOrder += 1;
    }
  }

  return sessions;
}

export async function seedProgrammeTemplates() {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false as const, error: "Supabase service role not configured" };
  }

  const supabase = createServiceClient();
  const addictionSlugsWithContent = [...new Set(caseStudies.map((study) => study.addictionSlug))];

  let templatesCreated = 0;
  let sessionsCreated = 0;

  for (const addictionSlug of addictionSlugsWithContent) {
    const programme = programmes.find((item) => item.slug === addictionSlug);
    const programmeStudy = getCaseStudiesByAddiction(addictionSlug).find((study) => study.caseStudyType === "programme");

    const { data: existing } = await supabase
      .from("programme_templates")
      .select("id")
      .eq("addiction_slug", addictionSlug)
      .maybeSingle();

    if (existing) {
      continue;
    }

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
    const sessionSeeds = buildSessionsForAddiction(addictionSlug);

    const { error: sessionsError } = await supabase.from("programme_sessions").insert(
      sessionSeeds.map((session) => ({
        template_id: template.id,
        ...session,
      })),
    );

    if (sessionsError) {
      console.error("Session seed failed:", sessionsError);
    } else {
      sessionsCreated += sessionSeeds.length;
    }
  }

  return { ok: true as const, templatesCreated, sessionsCreated };
}

export function getCaseStudyContent(slug: string) {
  return caseStudies.find((study) => study.slug === slug) ?? null;
}

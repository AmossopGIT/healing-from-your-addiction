import { createClient } from "@/lib/supabase/server";

export type ProgrammeFunnelRow = {
  addictionSlug: string;
  title: string;
  enrollments: number;
  started: number;
  completed: number;
  avgCompletedActivities: number;
  inactiveActiveClients: number;
  safetyFlags: number;
  avgDaysToStart: number | null;
};

export type ProgrammeReportingFilters = {
  programmeSlug?: string | null;
  from?: string | null;
  to?: string | null;
};

export type ActivityDropOffRow = {
  programmeSlug: string;
  activityId: string;
  started: number;
  completed: number;
  dropOffRate: number;
};

export type MoodUrgeTrendPoint = {
  date: string;
  avgUrge: number | null;
  checkIns: number;
  moodCounts: Record<string, number>;
};

function inDateRange(iso: string | null | undefined, from?: string | null, to?: string | null) {
  if (!iso) return false;
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export async function getProgrammeReportingSummary(
  filters: ProgrammeReportingFilters = {},
): Promise<ProgrammeFunnelRow[]> {
  const supabase = await createClient();
  const [{ data: templates }, { data: enrollments }, { data: progress }, { data: events }] = await Promise.all([
    supabase.from("programme_templates").select("id, addiction_slug, title"),
    supabase
      .from("enrollments")
      .select("id, template_id, status, journey_started_at, journey_completed_at, last_activity_at, created_at"),
    supabase.from("client_activity_progress").select("enrollment_id, status"),
    supabase
      .from("programme_activity_events")
      .select("enrollment_id, programme_slug, event_type, occurred_at")
      .eq("event_type", "safety_flag")
      .limit(5000),
  ]);

  const completedByEnrollment = new Map<string, number>();
  for (const row of progress ?? []) {
    if (row.status !== "completed") continue;
    completedByEnrollment.set(row.enrollment_id, (completedByEnrollment.get(row.enrollment_id) ?? 0) + 1);
  }

  const safetyBySlug = new Map<string, number>();
  for (const event of events ?? []) {
    if (!inDateRange(event.occurred_at, filters.from, filters.to)) continue;
    const slug = event.programme_slug ?? "unknown";
    safetyBySlug.set(slug, (safetyBySlug.get(slug) ?? 0) + 1);
  }

  const now = Date.now();
  return (templates ?? [])
    .filter((template) => !filters.programmeSlug || template.addiction_slug === filters.programmeSlug)
    .map((template) => {
      const rows = (enrollments ?? []).filter((enrollment) => {
        if (enrollment.template_id !== template.id) return false;
        if (filters.from || filters.to) {
          return inDateRange(enrollment.created_at, filters.from, filters.to);
        }
        return true;
      });
      const started = rows.filter((row) => row.journey_started_at).length;
      const completed = rows.filter((row) => row.journey_completed_at || row.status === "completed").length;
      const completedCounts = rows.map((row) => completedByEnrollment.get(row.id) ?? 0);
      const avgCompletedActivities = completedCounts.length
        ? Math.round((completedCounts.reduce((sum, value) => sum + value, 0) / completedCounts.length) * 10) / 10
        : 0;
      const inactiveActiveClients = rows.filter((row) => {
        if (row.status !== "active") return false;
        if (!row.last_activity_at) return true;
        return (now - new Date(row.last_activity_at).getTime()) / (1000 * 60 * 60 * 24) >= 5;
      }).length;

      const startDeltas = rows
        .filter((row) => row.journey_started_at && row.created_at)
        .map((row) => {
          const ms = new Date(row.journey_started_at as string).getTime() - new Date(row.created_at).getTime();
          return ms / (1000 * 60 * 60 * 24);
        })
        .filter((value) => Number.isFinite(value) && value >= 0);
      const avgDaysToStart = startDeltas.length
        ? Math.round((startDeltas.reduce((sum, value) => sum + value, 0) / startDeltas.length) * 10) / 10
        : null;

      return {
        addictionSlug: template.addiction_slug,
        title: template.title,
        enrollments: rows.length,
        started,
        completed,
        avgCompletedActivities,
        inactiveActiveClients,
        safetyFlags: safetyBySlug.get(template.addiction_slug) ?? 0,
        avgDaysToStart,
      };
    });
}

export async function getActivityDropOffReport(
  filters: ProgrammeReportingFilters = {},
): Promise<ActivityDropOffRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("programme_activity_events")
    .select("programme_slug, activity_id, event_type, occurred_at")
    .in("event_type", ["started", "viewed", "completed"])
    .limit(10000);
  if (filters.programmeSlug) query = query.eq("programme_slug", filters.programmeSlug);
  const { data: events } = await query;

  const byKey = new Map<string, { started: number; completed: number; programmeSlug: string; activityId: string }>();
  for (const event of events ?? []) {
    if (!event.activity_id || !event.programme_slug) continue;
    if (!inDateRange(event.occurred_at, filters.from, filters.to)) continue;
    const key = `${event.programme_slug}:${event.activity_id}`;
    const row = byKey.get(key) ?? {
      started: 0,
      completed: 0,
      programmeSlug: event.programme_slug,
      activityId: event.activity_id,
    };
    if (event.event_type === "completed") row.completed += 1;
    else row.started += 1;
    byKey.set(key, row);
  }

  return [...byKey.values()]
    .map((row) => ({
      programmeSlug: row.programmeSlug,
      activityId: row.activityId,
      started: row.started,
      completed: row.completed,
      dropOffRate: row.started > 0 ? Math.round((1 - row.completed / row.started) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.dropOffRate - a.dropOffRate)
    .slice(0, 50);
}

export async function getMoodUrgeTrends(
  clientProfileId?: string,
  filters: ProgrammeReportingFilters = {},
): Promise<MoodUrgeTrendPoint[]> {
  const supabase = await createClient();
  let query = supabase
    .from("client_daily_check_ins")
    .select("check_in_date, mood, craving_level, client_profile_id")
    .order("check_in_date", { ascending: true })
    .limit(500);
  if (clientProfileId) query = query.eq("client_profile_id", clientProfileId);
  const { data } = await query;

  const byDate = new Map<string, MoodUrgeTrendPoint>();
  for (const row of data ?? []) {
    if (!inDateRange(row.check_in_date, filters.from, filters.to)) continue;
    const point = byDate.get(row.check_in_date) ?? {
      date: row.check_in_date,
      avgUrge: null,
      checkIns: 0,
      moodCounts: {},
    };
    point.checkIns += 1;
    point.moodCounts[row.mood] = (point.moodCounts[row.mood] ?? 0) + 1;
    const prevSum = (point.avgUrge ?? 0) * (point.checkIns - 1);
    point.avgUrge = Math.round(((prevSum + row.craving_level) / point.checkIns) * 10) / 10;
    byDate.set(row.check_in_date, point);
  }
  return [...byDate.values()];
}

export function reportingRowsToCsv(rows: ProgrammeFunnelRow[]) {
  const header = [
    "programme_slug",
    "title",
    "enrollments",
    "started",
    "completed",
    "avg_completed_activities",
    "inactive_active_clients",
    "safety_flags",
    "avg_days_to_start",
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.addictionSlug,
        JSON.stringify(row.title),
        row.enrollments,
        row.started,
        row.completed,
        row.avgCompletedActivities,
        row.inactiveActiveClients,
        row.safetyFlags,
        row.avgDaysToStart ?? "",
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

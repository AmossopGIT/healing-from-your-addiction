import { NextResponse } from "next/server";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { buildProgrammeIcs, type ProgrammeCalendarEntry } from "@/lib/programme/schedule";
import { getAuthProfile } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getAuthProfile();
  if (!profile) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const bundle = await getClientEnrollmentBundle(profile.id);
  if (!bundle?.enrollment) {
    return NextResponse.json({ ok: false, error: "No programme assigned" }, { status: 404 });
  }

  const progressBySession = new Map(bundle.progress.map((item) => [item.session_id, item]));
  const entries: ProgrammeCalendarEntry[] = bundle.sessions.map((session) => {
    const progress = progressBySession.get(session.id);
    return {
      id: progress?.id ?? session.id,
      sessionNumber: session.session_number,
      weekNumber: session.week_number,
      title: session.title,
      scheduledAt: progress?.scheduled_at ?? null,
      durationMinutes: progress?.duration_minutes ?? null,
      status: progress?.status ?? "locked",
    };
  });

  const ics = buildProgrammeIcs({
    programmeTitle: bundle.template?.title ?? "Healing programme",
    meetUrl: bundle.schedule?.meet_url ?? null,
    entries,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="healing-programme-sessions.ics"',
      "Cache-Control": "no-store",
    },
  });
}

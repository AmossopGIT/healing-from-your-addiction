"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  computeFirstSessionAt,
  generateEightSessionDates,
  getMeetUrlForTimeSlot,
  PROGRAMME_TIMEZONE,
  sessionDurationMinutes,
} from "@/lib/programme/schedule";
import { sanitizeUuid } from "@/lib/dashboard/formValidation";
import { getClientProfileForUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { ProgrammeTimeSlot, ProgrammeWeekday } from "@/types/database";

const WEEKDAYS = new Set<ProgrammeWeekday>(["tue", "fri"]);
const SLOTS = new Set<ProgrammeTimeSlot>(["11:00", "16:00"]);

async function requireClientEnrollment() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  const clientProfile = await getClientProfileForUser(user.id);
  if (!clientProfile) redirect("/portal/onboarding/");

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("client_profile_id", clientProfile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!enrollment) redirect("/portal/programme/");

  return { supabase, clientProfile, enrollment };
}

async function applyScheduleToProgress(
  supabase: Awaited<ReturnType<typeof createClient>>,
  enrollmentId: string,
  templateId: string,
  firstSessionAt: string,
  weekday: ProgrammeWeekday,
) {
  const dates = generateEightSessionDates(firstSessionAt, weekday);
  const [{ data: progressRows }, { data: sessions }] = await Promise.all([
    supabase.from("session_progress").select("id, session_id").eq("enrollment_id", enrollmentId),
    supabase
      .from("programme_sessions")
      .select("id, session_number, sort_order")
      .eq("template_id", templateId)
      .order("sort_order", { ascending: true }),
  ]);

  const sessionById = new Map((sessions ?? []).map((session) => [session.id, session]));
  const ordered = (progressRows ?? [])
    .map((row) => {
      const session = sessionById.get(row.session_id);
      return {
        id: row.id,
        sessionNumber: session?.session_number ?? 0,
        sortOrder: session?.sort_order ?? 0,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.sessionNumber - b.sessionNumber);

  for (let index = 0; index < ordered.length && index < dates.length; index += 1) {
    const row = ordered[index];
    await supabase
      .from("session_progress")
      .update({
        scheduled_at: dates[index],
        duration_minutes: sessionDurationMinutes(row.sessionNumber || index + 1),
      })
      .eq("id", row.id);
  }
}

export async function saveEnrollmentSchedule(formData: FormData) {
  const weekday = String(formData.get("weekday") ?? "") as ProgrammeWeekday;
  const timeSlot = String(formData.get("timeSlot") ?? "") as ProgrammeTimeSlot;

  if (!WEEKDAYS.has(weekday) || !SLOTS.has(timeSlot)) {
    redirect("/portal/programme/schedule/?error=invalid-slot");
  }

  const { supabase, enrollment } = await requireClientEnrollment();
  const meetUrl = getMeetUrlForTimeSlot(timeSlot);
  const firstSessionAt = computeFirstSessionAt({
    fromDate: enrollment.start_date,
    weekday,
    timeSlot,
  });

  const { data: existing } = await supabase
    .from("enrollment_schedules")
    .select("id")
    .eq("enrollment_id", enrollment.id)
    .maybeSingle();

  const payload = {
    enrollment_id: enrollment.id,
    weekday,
    time_slot: timeSlot,
    meet_url: meetUrl,
    first_session_at: firstSessionAt,
    timezone: PROGRAMME_TIMEZONE,
  };

  if (existing) {
    const { error } = await supabase.from("enrollment_schedules").update(payload).eq("id", existing.id);
    if (error) redirect("/portal/programme/schedule/?error=save-failed");
  } else {
    const { error } = await supabase.from("enrollment_schedules").insert(payload);
    if (error) redirect("/portal/programme/schedule/?error=save-failed");
  }

  await applyScheduleToProgress(supabase, enrollment.id, enrollment.template_id, firstSessionAt, weekday);

  revalidatePath("/portal/programme/");
  revalidatePath("/portal/");
  redirect("/portal/programme/?scheduled=1");
}

export async function adminSaveEnrollmentSchedule(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const enrollmentId = sanitizeUuid(String(formData.get("enrollmentId") ?? ""));
  const weekday = String(formData.get("weekday") ?? "") as ProgrammeWeekday;
  const timeSlot = String(formData.get("timeSlot") ?? "") as ProgrammeTimeSlot;

  if (!clientProfileId || !enrollmentId || !WEEKDAYS.has(weekday) || !SLOTS.has(timeSlot)) {
    redirect(`/admin/clients/${clientProfileId || ""}/programme/?error=invalid-slot`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");

  const { data: enrollment } = await supabase.from("enrollments").select("*").eq("id", enrollmentId).single();
  if (!enrollment || enrollment.client_profile_id !== clientProfileId) {
    redirect(`/admin/clients/${clientProfileId}/programme/?error=not-found`);
  }

  const meetUrl = getMeetUrlForTimeSlot(timeSlot);
  const firstSessionAt = computeFirstSessionAt({
    fromDate: enrollment.start_date,
    weekday,
    timeSlot,
  });

  const { data: existing } = await supabase
    .from("enrollment_schedules")
    .select("id")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();

  const payload = {
    enrollment_id: enrollmentId,
    weekday,
    time_slot: timeSlot,
    meet_url: meetUrl,
    first_session_at: firstSessionAt,
    timezone: PROGRAMME_TIMEZONE,
  };

  if (existing) {
    await supabase.from("enrollment_schedules").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("enrollment_schedules").insert(payload);
  }

  await applyScheduleToProgress(supabase, enrollmentId, enrollment.template_id, firstSessionAt, weekday);

  revalidatePath(`/admin/clients/${clientProfileId}/programme/`);
  redirect(`/admin/clients/${clientProfileId}/programme/?scheduled=1`);
}

export async function adminSaveSessionRecording(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const progressId = sanitizeUuid(String(formData.get("progressId") ?? ""));
  const recordingUrl = String(formData.get("recordingUrl") ?? "").trim();
  const recordingLabel = String(formData.get("recordingLabel") ?? "").trim().slice(0, 200);

  if (!clientProfileId || !progressId) {
    redirect("/admin/clients/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");

  await supabase
    .from("session_progress")
    .update({
      recording_url: recordingUrl || null,
      recording_label: recordingLabel || null,
    })
    .eq("id", progressId);

  revalidatePath(`/admin/clients/${clientProfileId}/programme/`);
  redirect(`/admin/clients/${clientProfileId}/programme/?recordingSaved=1`);
}

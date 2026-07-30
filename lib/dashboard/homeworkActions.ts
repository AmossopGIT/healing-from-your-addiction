"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  dashboardFieldMaxLengths,
  normalizeMultiline,
  sanitizeRedirectPath,
  sanitizeUuid,
} from "@/lib/dashboard/formValidation";
import { getClientProfileForUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { CheckInMood } from "@/types/database";

const CHECK_IN_MOODS = new Set<CheckInMood>(["calm", "steady", "low", "anxious", "irritable"]);

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function toggleHomeworkTask(formData: FormData) {
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? "/portal/"), ["/portal/"], "/portal/");
  const taskId = sanitizeUuid(String(formData.get("taskId") ?? ""));
  const completed = String(formData.get("completed") ?? "") === "true";
  const moodRaw = String(formData.get("mood") ?? "").trim();
  const mood = moodRaw ? (moodRaw as CheckInMood) : null;
  const note = normalizeMultiline(String(formData.get("note") ?? ""));

  if (!taskId) redirect(`${redirectTo}?homework=invalid`);
  if (mood && !CHECK_IN_MOODS.has(mood)) redirect(`${redirectTo}?homework=invalid`);
  if (note.length > dashboardFieldMaxLengths.checkInNote) redirect(`${redirectTo}?homework=note-too-long`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  const clientProfile = await getClientProfileForUser(user.id);
  if (!clientProfile) redirect(`${redirectTo}?homework=failed`);

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("client_profile_id", clientProfile.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!enrollment) redirect(`${redirectTo}?homework=failed`);

  const { data: task } = await supabase
    .from("programme_homework_tasks")
    .select("*")
    .eq("id", taskId)
    .eq("template_id", enrollment.template_id)
    .maybeSingle();

  if (!task) redirect(`${redirectTo}?homework=invalid`);

  const entryDate = todayIsoDate();
  const { data: existing } = await supabase
    .from("client_homework_entries")
    .select("*")
    .eq("client_profile_id", clientProfile.id)
    .eq("task_id", taskId)
    .eq("entry_date", entryDate)
    .maybeSingle();

  const awardingPoints = completed && (!existing || !existing.completed);
  const pointsAwarded = awardingPoints ? task.points : existing?.points_awarded ?? 0;

  const payload = {
    client_profile_id: clientProfile.id,
    enrollment_id: enrollment.id,
    task_id: taskId,
    entry_date: entryDate,
    completed,
    mood,
    note: note || null,
    points_awarded: completed ? pointsAwarded : 0,
  };

  let entryId = existing?.id ?? null;

  if (existing) {
    const { error } = await supabase.from("client_homework_entries").update(payload).eq("id", existing.id);
    if (error) redirect(`${redirectTo}?homework=failed`);
  } else {
    const { data: inserted, error } = await supabase.from("client_homework_entries").insert(payload).select("id").single();
    if (error || !inserted) redirect(`${redirectTo}?homework=failed`);
    entryId = inserted.id;
  }

  if (awardingPoints && entryId) {
    await supabase.from("client_points_ledger").insert({
      client_profile_id: clientProfile.id,
      points: task.points,
      reason: `Completed ${task.title}`,
      source_type: "homework",
      source_id: entryId,
    });
  }

  if (!completed && existing?.completed && existing.points_awarded > 0) {
    await supabase.from("client_points_ledger").insert({
      client_profile_id: clientProfile.id,
      points: -existing.points_awarded,
      reason: `Unchecked ${task.title}`,
      source_type: "homework",
      source_id: existing.id,
    });
  }

  revalidatePath("/portal/");
  revalidatePath("/portal/programme/");
  redirect(`${redirectTo}?homework=saved`);
}

export async function releaseProgrammeDoc(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const docId = sanitizeUuid(String(formData.get("docId") ?? ""));

  if (!clientProfileId || !docId) redirect("/admin/clients/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");

  const { upsertClientContentReceipts } = await import("@/lib/dashboard/notifications");
  await upsertClientContentReceipts([
    {
      clientProfileId,
      contentKind: "programme_doc",
      contentId: docId,
    },
  ]);

  revalidatePath(`/admin/clients/${clientProfileId}/programme/`);
  redirect(`/admin/clients/${clientProfileId}/programme/?docReleased=1`);
}

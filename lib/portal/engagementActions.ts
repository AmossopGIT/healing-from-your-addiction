"use server";

import { redirect } from "next/navigation";
import {
  dashboardFieldMaxLengths,
  normalizeMultiline,
  normalizeSingleLine,
  sanitizeDateInput,
  sanitizeRedirectPath,
} from "@/lib/dashboard/formValidation";
import { getClientProfileForUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { CheckInMood } from "@/types/database";

const CHECK_IN_MOODS = new Set<CheckInMood>(["calm", "steady", "low", "anxious", "irritable"]);

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function submitDailyCheckIn(formData: FormData) {
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? "/portal/"), ["/portal/"], "/portal/");
  const mood = normalizeSingleLine(String(formData.get("mood") ?? "")) as CheckInMood;
  const cravingLevel = Number(formData.get("cravingLevel") ?? "");
  const pauseTaken = String(formData.get("pauseTaken") ?? "") === "on";
  const note = normalizeMultiline(String(formData.get("note") ?? ""));

  if (!CHECK_IN_MOODS.has(mood) || !Number.isInteger(cravingLevel) || cravingLevel < 0 || cravingLevel > 5) {
    redirect(`${redirectTo}?checkin=invalid`);
  }
  if (note.length > dashboardFieldMaxLengths.checkInNote) {
    redirect(`${redirectTo}?checkin=note-too-long`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") redirect("/portal/login/");

  const clientProfile = await getClientProfileForUser(user.id);
  if (!clientProfile) redirect(`${redirectTo}?checkin=failed`);

  const checkInDate = todayIsoDate();
  const payload = {
    client_profile_id: clientProfile.id,
    check_in_date: checkInDate,
    mood,
    craving_level: cravingLevel,
    pause_taken: pauseTaken,
    note: note || null,
  };

  const { data: existing } = await supabase
    .from("client_daily_check_ins")
    .select("id")
    .eq("client_profile_id", clientProfile.id)
    .eq("check_in_date", checkInDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("client_daily_check_ins").update(payload).eq("id", existing.id);
    if (error) redirect(`${redirectTo}?checkin=failed`);
  } else {
    const { error } = await supabase.from("client_daily_check_ins").insert(payload);
    if (error) redirect(`${redirectTo}?checkin=failed`);
  }

  redirect(`${redirectTo}?checkin=saved`);
}

export async function updateRecoveryGoal(formData: FormData) {
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? "/portal/account/"), ["/portal/"], "/portal/account/");
  const showAbstinenceCounter = String(formData.get("showAbstinenceCounter") ?? "") === "on";
  const rawStartDate = String(formData.get("abstinenceStartDate") ?? "");
  const abstinenceStartDate = sanitizeDateInput(rawStartDate);
  const goalNote = normalizeSingleLine(String(formData.get("goalNote") ?? ""));

  if (rawStartDate.trim() && !abstinenceStartDate) redirect(`${redirectTo}?goal=invalid-date`);
  if (goalNote.length > dashboardFieldMaxLengths.recoveryGoalNote) redirect(`${redirectTo}?goal=invalid-note`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  const clientProfile = await getClientProfileForUser(user.id);
  if (!clientProfile) redirect(`${redirectTo}?goal=failed`);

  const payload = {
    client_profile_id: clientProfile.id,
    show_abstinence_counter: showAbstinenceCounter,
    abstinence_start_date: showAbstinenceCounter ? abstinenceStartDate || todayIsoDate() : null,
    goal_note: showAbstinenceCounter && goalNote ? goalNote : null,
  };

  const { data: existing } = await supabase
    .from("client_recovery_goals")
    .select("client_profile_id")
    .eq("client_profile_id", clientProfile.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("client_recovery_goals").update(payload).eq("client_profile_id", clientProfile.id);
    if (error) redirect(`${redirectTo}?goal=failed`);
  } else {
    const { error } = await supabase.from("client_recovery_goals").insert(payload);
    if (error) redirect(`${redirectTo}?goal=failed`);
  }

  redirect(`${redirectTo}?goal=saved`);
}

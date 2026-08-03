"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getInteractiveProgramme } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import {
  dashboardFieldMaxLengths,
  normalizeMultiline,
  sanitizeRedirectPath,
  sanitizeUuid,
} from "@/lib/dashboard/formValidation";
import { resolveProgrammeDefinition, getOrderedActivities, findActivity } from "@/lib/programme/interactive/content";
import {
  buildInitialProgressRows,
  extractDailyCheckInPayload,
  isHighUrge,
  shouldShareWithAdmin,
  splitResponses,
  validateActivityResponses,
} from "@/lib/programme/interactive/progress";
import { recordProgrammeEvent } from "@/lib/programme/interactive/events";
import { createClient } from "@/lib/supabase/server";
import type { CheckInMood, ProgrammeReviewStatus } from "@/types/database";

const CHECK_IN_MOODS = new Set<CheckInMood>(["calm", "steady", "low", "anxious", "irritable"]);

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function asDefinition(value: unknown): InteractiveProgrammeDefinition | null {
  if (!value || typeof value !== "object") return null;
  if (!("slug" in value) || !("activities" in value)) return null;
  return value as InteractiveProgrammeDefinition;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/admin/login/");
  return { supabase, user };
}

async function requireClientProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");
  const { data: clientProfile } = await supabase.from("client_profiles").select("*").eq("user_id", user.id).maybeSingle();
  if (!clientProfile) redirect("/portal/onboarding/");
  return { supabase, user, clientProfile };
}

export async function assignInteractiveProgramme(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const templateId = sanitizeUuid(String(formData.get("templateId") ?? ""));
  const redirectTo = clientProfileId ? `/admin/clients/${clientProfileId}/programme/` : "/admin/clients/";
  if (!clientProfileId || !templateId) redirect(redirectTo);

  const { data: template, error: templateError } = await supabase
    .from("programme_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError || !template) redirect(`${redirectTo}?error=template-missing`);

  const definition =
    asDefinition(template.content_json) ??
    getInteractiveProgramme(template.addiction_slug);

  if (!definition) redirect(`${redirectTo}?error=content-missing`);

  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .insert({
      client_profile_id: clientProfileId,
      template_id: templateId,
      status: "active",
      current_session_number: 1,
      admin_id: user.id,
      programme_version: template.version ?? definition.version,
      current_activity_id: definition.activities[0]?.id ?? null,
      content_snapshot: definition,
      journey_started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !enrollment) redirect(`${redirectTo}?error=enrollment-failed`);

  const progressRows = buildInitialProgressRows(definition, enrollment.id);
  const { error: progressError } = await supabase.from("client_activity_progress").insert(progressRows);
  if (progressError) {
    console.error("Failed to create activity progress", progressError);
    redirect(`${redirectTo}?error=progress-failed`);
  }

  // Keep live-session scaffolding available for coaching calls.
  const { data: sessions } = await supabase
    .from("programme_sessions")
    .select("id, session_number")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });

  if (sessions?.length) {
    await supabase.from("session_progress").insert(
      sessions.map((session, index) => ({
        enrollment_id: enrollment.id,
        session_id: session.id,
        status: index < 2 ? ("available" as const) : ("locked" as const),
        unlocked_at: index < 2 ? new Date().toISOString() : null,
      })),
    );
  }

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?assigned=1`);
}

export async function saveActivityProgress(formData: FormData) {
  const { supabase, clientProfile } = await requireClientProfile();
  const enrollmentId = sanitizeUuid(String(formData.get("enrollmentId") ?? ""));
  const activityId = String(formData.get("activityId") ?? "").trim();
  const complete = String(formData.get("complete") ?? "") === "1";
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") ?? `/portal/programme/journey/${activityId}/`),
    ["/portal/"],
    "/portal/programme/",
  );

  if (!enrollmentId || !activityId) redirect("/portal/programme/");

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .eq("client_profile_id", clientProfile.id)
    .maybeSingle();

  if (!enrollment) redirect("/portal/programme/");

  const definition =
    resolveProgrammeDefinition(
      "",
      asDefinition(enrollment.content_snapshot),
    ) ??
    (await (async () => {
      const { data: template } = await supabase
        .from("programme_templates")
        .select("addiction_slug, content_json")
        .eq("id", enrollment.template_id)
        .maybeSingle();
      return (
        asDefinition(template?.content_json) ??
        (template ? getInteractiveProgramme(template.addiction_slug) : null)
      );
    })());

  if (!definition) redirect("/portal/programme/?error=content-missing");

  const activity = findActivity(definition, activityId);
  if (!activity) redirect("/portal/programme/?error=activity-missing");

  const { data: progress } = await supabase
    .from("client_activity_progress")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .eq("activity_id", activityId)
    .maybeSingle();

  if (!progress || progress.status === "locked") {
    redirect(`${redirectTo}?error=locked`);
  }

  const responses: Record<string, unknown> = {};
  for (const field of activity.fields ?? []) {
    const raw = formData.get(`field_${field.key}`);
    if (field.kind === "checkbox") {
      responses[field.key] = raw === "on" || raw === "true" || raw === "1";
      continue;
    }
    if (field.kind === "scale") {
      const numberValue = Number(raw);
      responses[field.key] = Number.isFinite(numberValue) ? numberValue : null;
      continue;
    }
    if (field.kind === "multi_choice") {
      responses[field.key] = formData
        .getAll(`field_${field.key}`)
        .map((value) => String(value))
        .filter(Boolean);
      continue;
    }
    if (field.kind === "mood") {
      const mood = String(raw ?? "").trim();
      responses[field.key] = CHECK_IN_MOODS.has(mood as CheckInMood) ? mood : null;
      continue;
    }
    responses[field.key] = normalizeMultiline(String(raw ?? "")).slice(0, dashboardFieldMaxLengths.intakeResponse);
  }

  if (complete) {
    const validationError = validateActivityResponses(activity, responses);
    if (validationError) {
      redirect(`${redirectTo}?error=${encodeURIComponent(validationError)}`);
    }
  }

  const shared = shouldShareWithAdmin(responses);
  const { publicResponses, privateResponses } = splitResponses(activity, responses);
  const now = new Date().toISOString();
  const alreadyCompleted = progress.status === "completed";
  const points = !alreadyCompleted && complete ? activity.points : progress.points_awarded;
  const highUrge = isHighUrge(activity, responses, definition.dailyCheckIn?.highUrgeThreshold ?? 4);

  const { error: updateError } = await supabase
    .from("client_activity_progress")
    .update({
      status: complete ? "completed" : "in_progress",
      responses: publicResponses,
      public_responses: publicResponses,
      shared_with_admin: shared,
      points_awarded: points,
      started_at: progress.started_at ?? now,
      completed_at: complete ? now : progress.completed_at,
    })
    .eq("id", progress.id);

  if (updateError) redirect(`${redirectTo}?error=save-failed`);

  if (Object.keys(privateResponses).length > 0) {
    await supabase.from("client_activity_private_answers").upsert(
      {
        progress_id: progress.id,
        enrollment_id: enrollmentId,
        client_profile_id: clientProfile.id,
        private_responses: privateResponses,
        shared_with_admin: shared,
      },
      { onConflict: "progress_id" },
    );
  }

  // Canonical daily check-in when mood/urge present on daily affirmation activities.
  const checkIn = extractDailyCheckInPayload(responses, privateResponses, shared);
  if (activity.type === "daily_affirmation" && checkIn) {
    const checkInDate = todayIsoDate();
    const payload = {
      client_profile_id: clientProfile.id,
      check_in_date: checkInDate,
      mood: checkIn.mood as CheckInMood,
      craving_level: checkIn.craving_level,
      pause_taken: checkIn.pause_taken,
      note: checkIn.note ? checkIn.note.slice(0, dashboardFieldMaxLengths.checkInNote) : null,
    };
    const { data: existingCheckIn } = await supabase
      .from("client_daily_check_ins")
      .select("id")
      .eq("client_profile_id", clientProfile.id)
      .eq("check_in_date", checkInDate)
      .maybeSingle();
    if (existingCheckIn) {
      await supabase.from("client_daily_check_ins").update(payload).eq("id", existingCheckIn.id);
    } else {
      await supabase.from("client_daily_check_ins").insert(payload);
    }
  }

  if (!alreadyCompleted && complete && activity.points > 0) {
    await supabase.from("client_points_ledger").insert({
      client_profile_id: clientProfile.id,
      points: activity.points,
      reason: `Completed: ${activity.title}`,
      source_type: "activity",
      source_id: progress.id,
    });
  }

  await recordProgrammeEvent({
    supabase,
    enrollmentId,
    clientProfileId: clientProfile.id,
    programmeSlug: definition.slug,
    programmeVersion: definition.version,
    moduleId: activity.moduleId,
    activityId,
    eventType: complete ? "completed" : "saved",
    actorRole: "client",
    actorId: clientProfile.user_id,
    idempotencyKey: `${enrollmentId}:${activityId}:${complete ? "completed" : "saved"}:${progress.updated_at ?? now}`,
    metadata: {
      high_urge: highUrge,
      shared_with_admin: shared,
      activity_type: activity.type,
    },
  });

  if (highUrge) {
    await recordProgrammeEvent({
      supabase,
      enrollmentId,
      clientProfileId: clientProfile.id,
      programmeSlug: definition.slug,
      programmeVersion: definition.version,
      moduleId: activity.moduleId,
      activityId,
      eventType: "safety_flag",
      actorRole: "system",
      idempotencyKey: `${enrollmentId}:${activityId}:safety:${now.slice(0, 13)}`,
      metadata: { urge_level: responses.urge_level },
    });
  }

  const ordered = getOrderedActivities(definition);
  let nextActivityId = enrollment.current_activity_id;
  let journeyCompletedAt = enrollment.journey_completed_at;

  if (complete) {
    const currentIndex = ordered.findIndex((item) => item.id === activityId);
    const next = ordered[currentIndex + 1] ?? null;
    if (next) {
      nextActivityId = next.id;
      await supabase
        .from("client_activity_progress")
        .update({ status: "available" })
        .eq("enrollment_id", enrollmentId)
        .eq("activity_id", next.id)
        .eq("status", "locked");
      await recordProgrammeEvent({
        supabase,
        enrollmentId,
        clientProfileId: clientProfile.id,
        programmeSlug: definition.slug,
        programmeVersion: definition.version,
        moduleId: next.moduleId,
        activityId: next.id,
        eventType: "unlocked",
        actorRole: "system",
        idempotencyKey: `${enrollmentId}:${next.id}:unlocked`,
      });
    } else {
      journeyCompletedAt = now;
      await supabase.from("enrollments").update({ status: "completed", journey_completed_at: now }).eq("id", enrollmentId);
      await recordProgrammeEvent({
        supabase,
        enrollmentId,
        clientProfileId: clientProfile.id,
        programmeSlug: definition.slug,
        programmeVersion: definition.version,
        eventType: "programme_completed",
        actorRole: "system",
        idempotencyKey: `${enrollmentId}:programme_completed`,
      });
    }

    const moduleActivities = ordered.filter((item) => item.moduleId === activity.moduleId);
    const { data: moduleProgress } = await supabase
      .from("client_activity_progress")
      .select("activity_id, status")
      .eq("enrollment_id", enrollmentId)
      .in(
        "activity_id",
        moduleActivities.map((item) => item.id),
      );
    const completedModule =
      moduleActivities.length > 0 &&
      moduleActivities.every((item) =>
        item.id === activityId
          ? true
          : (moduleProgress ?? []).some((row) => row.activity_id === item.id && row.status === "completed"),
      );
    if (completedModule) {
      await recordProgrammeEvent({
        supabase,
        enrollmentId,
        clientProfileId: clientProfile.id,
        programmeSlug: definition.slug,
        programmeVersion: definition.version,
        moduleId: activity.moduleId,
        activityId,
        eventType: "module_completed",
        actorRole: "system",
        idempotencyKey: `${enrollmentId}:${activity.moduleId}:module_completed`,
      });
    }
  }

  await supabase
    .from("enrollments")
    .update({
      current_activity_id: nextActivityId,
      last_activity_at: now,
      journey_started_at: enrollment.journey_started_at ?? now,
      journey_completed_at: journeyCompletedAt,
    })
    .eq("id", enrollmentId);

  revalidatePath("/portal/programme/");
  revalidatePath(`/portal/programme/journey/`);
  revalidatePath("/portal/");

  if (complete) {
    const currentIndex = ordered.findIndex((item) => item.id === activityId);
    const next = ordered[currentIndex + 1];
    if (next) redirect(`/portal/programme/journey/${next.id}/?completed=1`);
    redirect("/portal/programme/?journeyComplete=1");
  }

  redirect(`${redirectTo}?saved=1`);
}

export async function adminUnlockActivity(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const progressId = sanitizeUuid(String(formData.get("progressId") ?? ""));
  const redirectTo = clientProfileId ? `/admin/clients/${clientProfileId}/programme/` : "/admin/clients/";
  if (!progressId || !clientProfileId) redirect(redirectTo);

  const { data: progress } = await supabase
    .from("client_activity_progress")
    .select("id, enrollment_id, activity_id")
    .eq("id", progressId)
    .maybeSingle();
  if (!progress) redirect(`${redirectTo}?error=unlock-failed`);

  const { error } = await supabase
    .from("client_activity_progress")
    .update({ status: "available", started_at: new Date().toISOString() })
    .eq("id", progressId);

  if (error) redirect(`${redirectTo}?error=unlock-failed`);

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, client_profile_id, programme_version, content_snapshot, template_id")
    .eq("id", progress.enrollment_id)
    .maybeSingle();
  const definition = asDefinition(enrollment?.content_snapshot);
  await recordProgrammeEvent({
    supabase,
    enrollmentId: progress.enrollment_id,
    clientProfileId,
    programmeSlug: definition?.slug ?? null,
    programmeVersion: enrollment?.programme_version ?? definition?.version ?? null,
    activityId: progress.activity_id,
    eventType: "unlocked",
    actorRole: "admin",
    actorId: user.id,
    idempotencyKey: `${progress.enrollment_id}:${progress.activity_id}:admin_unlocked:${Date.now()}`,
  });

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?unlocked=1`);
}

export async function adminSkipActivity(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const progressId = sanitizeUuid(String(formData.get("progressId") ?? ""));
  const reason = normalizeMultiline(String(formData.get("reason") ?? "")).slice(0, 500);
  const redirectTo = clientProfileId ? `/admin/clients/${clientProfileId}/programme/` : "/admin/clients/";
  if (!progressId || !clientProfileId || !reason) redirect(redirectTo);

  const { data: progress } = await supabase
    .from("client_activity_progress")
    .select("id, enrollment_id, activity_id")
    .eq("id", progressId)
    .maybeSingle();
  if (!progress) redirect(`${redirectTo}?error=skip-failed`);

  const { error } = await supabase
    .from("client_activity_progress")
    .update({
      status: "skipped",
      skipped_reason: reason,
      completed_at: new Date().toISOString(),
    })
    .eq("id", progressId);

  if (error) redirect(`${redirectTo}?error=skip-failed`);

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("programme_version, content_snapshot")
    .eq("id", progress.enrollment_id)
    .maybeSingle();
  const definition = asDefinition(enrollment?.content_snapshot);
  await recordProgrammeEvent({
    supabase,
    enrollmentId: progress.enrollment_id,
    clientProfileId,
    programmeSlug: definition?.slug ?? null,
    programmeVersion: enrollment?.programme_version ?? definition?.version ?? null,
    activityId: progress.activity_id,
    eventType: "skipped",
    actorRole: "admin",
    actorId: user.id,
    idempotencyKey: `${progress.enrollment_id}:${progress.activity_id}:admin_skipped:${Date.now()}`,
    metadata: { has_reason: Boolean(reason) },
  });

  revalidatePath(redirectTo);
  redirect(`${redirectTo}?skipped=1`);
}

export async function adminAddProgrammeFlag(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const enrollmentId = sanitizeUuid(String(formData.get("enrollmentId") ?? ""));
  const flagType = String(formData.get("flagType") ?? "note");
  const severity = String(formData.get("severity") ?? "info");
  const note = normalizeMultiline(String(formData.get("note") ?? "")).slice(0, 1000);
  const redirectTo = clientProfileId ? `/admin/clients/${clientProfileId}/programme/` : "/admin/clients/";

  if (!clientProfileId || !enrollmentId || !note) redirect(redirectTo);
  if (!["safety", "inactive", "support", "note"].includes(flagType)) redirect(redirectTo);
  if (!["info", "watch", "urgent"].includes(severity)) redirect(redirectTo);

  const { error } = await supabase.from("programme_admin_flags").insert({
    enrollment_id: enrollmentId,
    client_profile_id: clientProfileId,
    flag_type: flagType as "safety" | "inactive" | "support" | "note",
    severity: severity as "info" | "watch" | "urgent",
    note,
    created_by: user.id,
  });

  if (error) redirect(`${redirectTo}?error=flag-failed`);
  revalidatePath(redirectTo);
  redirect(`${redirectTo}?flagged=1`);
}

export async function saveProgrammeDraft(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  const title = normalizeMultiline(String(formData.get("title") ?? "")).slice(0, 200);
  const description = normalizeMultiline(String(formData.get("description") ?? "")).slice(0, 2000);
  const safetyDisclaimer = normalizeMultiline(String(formData.get("safetyDisclaimer") ?? "")).slice(0, 2000);
  const safetyReminder = normalizeMultiline(String(formData.get("safetyReminder") ?? "")).slice(0, 2000);
  const safetyEscalation = normalizeMultiline(String(formData.get("safetyEscalation") ?? "")).slice(0, 2000);
  const redirectTo = slug ? `/admin/programmes/${slug}/` : "/admin/programmes/";
  if (!slug || !title) redirect(redirectTo);

  const source = getInteractiveProgramme(slug);
  const { data: template } = await supabase
    .from("programme_templates")
    .select("*")
    .eq("addiction_slug", slug)
    .maybeSingle();

  const base =
    asDefinition(template?.draft_content_json) ??
    asDefinition(template?.content_json) ??
    source;
  if (!base) redirect(`${redirectTo}?error=content-missing`);

  const draft: InteractiveProgrammeDefinition = {
    ...base,
    title,
    description: description || base.description,
    safety: {
      ...base.safety,
      disclaimer: safetyDisclaimer || base.safety.disclaimer,
      reminder: safetyReminder || base.safety.reminder,
      escalation: safetyEscalation || base.safety.escalation,
    },
    status: "draft",
  };

  if (!template) redirect(`${redirectTo}?error=template-missing`);

  const { data: existingDraftVersion } = await supabase
    .from("programme_versions")
    .select("id, version")
    .eq("template_id", template.id)
    .eq("status", "draft")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const draftVersionNumber = existingDraftVersion?.version ?? Math.max(template.version ?? 1, base.version) + 1;
  draft.version = draftVersionNumber;

  const { error: templateError } = await supabase
    .from("programme_templates")
    .update({
      draft_content_json: draft,
      title: draft.title,
      description: draft.description,
      safety_json: draft.safety,
      cadence_json: draft.cadence ?? {},
      source_checksum: draft.sourceChecksum ?? null,
      review_status: template.review_status ?? "pending",
    })
    .eq("id", template.id);

  if (templateError) redirect(`${redirectTo}?error=draft-failed`);

  if (existingDraftVersion) {
    await supabase
      .from("programme_versions")
      .update({
        content_json: draft,
        source_checksum: draft.sourceChecksum ?? null,
        review_status: "pending",
      })
      .eq("id", existingDraftVersion.id);
  } else {
    await supabase.from("programme_versions").insert({
      template_id: template.id,
      version: draftVersionNumber,
      status: "draft",
      content_json: draft,
      source_checksum: draft.sourceChecksum ?? null,
      review_status: "pending",
      created_by: user.id,
    });
  }

  revalidatePath(redirectTo);
  revalidatePath("/admin/programmes/");
  redirect(`${redirectTo}?draftSaved=1`);
}

export async function publishProgrammeVersion(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  const redirectTo = slug ? `/admin/programmes/${slug}/` : "/admin/programmes/";
  if (!slug) redirect(redirectTo);

  const { data: template } = await supabase
    .from("programme_templates")
    .select("*")
    .eq("addiction_slug", slug)
    .maybeSingle();
  if (!template) redirect(`${redirectTo}?error=template-missing`);

  const draft =
    asDefinition(template.draft_content_json) ??
    asDefinition(template.content_json) ??
    getInteractiveProgramme(slug);
  if (!draft) redirect(`${redirectTo}?error=content-missing`);

  const requiresApproval =
    draft.category === "substance" ||
    ["alcohol", "opioid", "prescription-drug", "stimulant", "inhalant"].includes(slug);
  if (requiresApproval && template.review_status !== "approved") {
    redirect(`${redirectTo}?error=review-required`);
  }

  const { data: draftVersion } = await supabase
    .from("programme_versions")
    .select("*")
    .eq("template_id", template.id)
    .eq("status", "draft")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const publishVersion = draftVersion?.version ?? (template.version ?? draft.version) + 1;
  const publishedDefinition: InteractiveProgrammeDefinition = {
    ...draft,
    version: publishVersion,
    status: "published",
    reviewStatus: "approved",
  };
  const now = new Date().toISOString();

  // Archive previous published versions; never rewrite enrollment snapshots.
  await supabase
    .from("programme_versions")
    .update({ status: "archived" })
    .eq("template_id", template.id)
    .eq("status", "published");

  if (draftVersion) {
    await supabase
      .from("programme_versions")
      .update({
        status: "published",
        content_json: publishedDefinition,
        published_at: now,
        review_status: "approved",
      })
      .eq("id", draftVersion.id);
  } else {
    await supabase.from("programme_versions").insert({
      template_id: template.id,
      version: publishVersion,
      status: "published",
      content_json: publishedDefinition,
      source_checksum: publishedDefinition.sourceChecksum ?? null,
      review_status: "approved",
      created_by: user.id,
      published_at: now,
    });
  }

  const { error } = await supabase
    .from("programme_templates")
    .update({
      title: publishedDefinition.title,
      description: publishedDefinition.description,
      safety_json: publishedDefinition.safety,
      content_json: publishedDefinition,
      draft_content_json: null,
      version: publishVersion,
      status: "published",
      published_at: now,
      week_count: publishedDefinition.weekCount,
      day_count: publishedDefinition.dayCount,
      session_count: publishedDefinition.cadence?.liveSessionCount ?? template.session_count ?? 8,
      cadence_json: publishedDefinition.cadence ?? {},
      source_checksum: publishedDefinition.sourceChecksum ?? null,
      review_status: "approved",
      reviewed_at: template.reviewed_at ?? now,
      reviewed_by: template.reviewed_by ?? user.id,
    })
    .eq("id", template.id);

  if (error) redirect(`${redirectTo}?error=publish-failed`);

  revalidatePath(redirectTo);
  revalidatePath("/admin/programmes/");
  revalidatePath("/admin/programmes/review/");
  redirect(`${redirectTo}?published=1`);
}

export async function setProgrammeReviewStatus(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  const reviewStatusRaw = String(formData.get("reviewStatus") ?? "").trim();
  const reviewNotes = normalizeMultiline(String(formData.get("reviewNotes") ?? "")).slice(0, 2000);
  const redirectTo = String(formData.get("redirectTo") ?? (slug ? `/admin/programmes/${slug}/` : "/admin/programmes/review/"));
  const safeRedirect = sanitizeRedirectPath(redirectTo, ["/admin/"], "/admin/programmes/review/");

  if (!slug || !["pending", "approved", "changes_requested"].includes(reviewStatusRaw)) {
    redirect(safeRedirect);
  }
  const reviewStatus = reviewStatusRaw as ProgrammeReviewStatus;

  const { data: template } = await supabase
    .from("programme_templates")
    .select("id")
    .eq("addiction_slug", slug)
    .maybeSingle();
  if (!template) redirect(`${safeRedirect}?error=template-missing`);

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("programme_templates")
    .update({
      review_status: reviewStatus,
      review_notes: reviewNotes || null,
      reviewed_at: now,
      reviewed_by: user.id,
    })
    .eq("id", template.id);

  if (error) redirect(`${safeRedirect}?error=review-failed`);

  await supabase
    .from("programme_versions")
    .update({ review_status: reviewStatus })
    .eq("template_id", template.id)
    .eq("status", "draft");

  revalidatePath(safeRedirect);
  revalidatePath(`/admin/programmes/${slug}/`);
  revalidatePath("/admin/programmes/review/");
  redirect(`${safeRedirect}?reviewed=1`);
}

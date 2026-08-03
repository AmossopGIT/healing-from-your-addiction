"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  READINESS_ASSESSMENT_VERSION,
  READINESS_RETENTION_YEARS,
  type ReadinessFoundationId,
  type ReadinessNextStep,
  type ReadinessResponses,
  type ReadinessReviewStatus,
} from "@/content/readinessAssessment";
import {
  dashboardFieldMaxLengths,
  normalizeMultiline,
  sanitizeRedirectPath,
  sanitizeUuid,
} from "@/lib/dashboard/formValidation";
import { createDraftToken, decryptDraftResponses, draftExpiresAt, encryptDraftResponses, hashDraftToken } from "@/lib/readiness/draftCrypto";
import { parsePartialReadinessResponses, parseReadinessResponses } from "@/lib/readiness/parse";
import { absoluteUrl } from "@/lib/constants";
import { getLeadNotificationEmail, getResendFromEmail, isResendConfigured } from "@/lib/email/resend";
import { getClientProfileForUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Resend } from "resend";

const PORTAL_REDIRECT = "/portal/readiness/";

function retentionUntilIso(from = new Date()) {
  const date = new Date(from);
  date.setFullYear(date.getFullYear() + READINESS_RETENTION_YEARS);
  return date.toISOString().slice(0, 10);
}

async function ensureMinimalClientProfile(userId: string) {
  const supabase = await createClient();
  const existing = await getClientProfileForUser(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("client_profiles")
    .insert({
      user_id: userId,
      addiction_slug: null,
      preferred_contact_method: null,
      emergency_contact: null,
      onboarding_completed_at: null,
    })
    .select("*")
    .single();

  if (error || !data) {
    // Race: another request may have created it.
    const retry = await getClientProfileForUser(userId);
    if (retry) return retry;
    return null;
  }

  return data;
}

async function notifyAdminReadinessCompleted(input: {
  clientProfileId: string;
  assessmentId: string;
  readinessIndex: number;
  urgentSafety: boolean;
}) {
  try {
    const supabase = await createClient();
    const href = `/admin/clients/${input.clientProfileId}/readiness/`;
    await supabase.from("admin_notifications").insert({
      kind: "readiness_completed",
      title: input.urgentSafety ? "Urgent readiness assessment completed" : "Readiness assessment completed",
      body: input.urgentSafety
        ? "A client completed the readiness assessment with urgent safety answers flagged."
        : `A client completed the readiness assessment (index ${input.readinessIndex}/100).`,
      href,
      client_profile_id: input.clientProfileId,
      source_id: input.assessmentId,
    });

    if (!isResendConfigured()) return;
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return;
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: getResendFromEmail(),
      to: [getLeadNotificationEmail()],
      subject: input.urgentSafety ? "Urgent readiness assessment completed" : "New readiness assessment completed",
      text: `A client completed the Addiction Healing Readiness Assessment.\n\nOpen: ${absoluteUrl(href)}\n`,
    });
  } catch (error) {
    console.error("Readiness admin notification failed:", error);
  }
}

async function persistCompletedAssessment(input: {
  clientProfileId: string;
  responses: ReadinessResponses;
  scores: ReturnType<typeof parseReadinessResponses> extends { scores: infer S } | { error: string } ? S : never;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: previous } = await supabase
    .from("readiness_assessments")
    .select("attempt_number")
    .eq("client_profile_id", input.clientProfileId)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase
    .from("readiness_assessments")
    .update({ is_current: false })
    .eq("client_profile_id", input.clientProfileId)
    .eq("is_current", true);

  const payload = {
    client_profile_id: input.clientProfileId,
    assessment_version: READINESS_ASSESSMENT_VERSION,
    responses: input.responses,
    commitment_score: input.scores.commitment,
    self_awareness_score: input.scores.self_awareness,
    emotional_capacity_score: input.scores.emotional_capacity,
    readiness_product: input.scores.readinessProduct,
    readiness_index: input.scores.readinessIndex,
    readiness_band: input.scores.readinessBand,
    focus_areas: input.scores.focusAreas,
    attempt_number: (previous?.attempt_number ?? 0) + 1,
    is_current: true,
    urgent_safety: input.scores.urgentSafety,
    next_step: input.scores.nextStep,
    privacy_consent_at: now,
    review_status: "unreviewed" as const,
    retention_until: retentionUntilIso(),
    completed_at: now,
  };

  const { data, error } = await supabase.from("readiness_assessments").insert(payload).select("id").single();
  if (error || !data) {
    return { error: "save-failed" as const };
  }

  void notifyAdminReadinessCompleted({
    clientProfileId: input.clientProfileId,
    assessmentId: data.id,
    readinessIndex: input.scores.readinessIndex,
    urgentSafety: input.scores.urgentSafety,
  });

  return { id: data.id };
}

export async function saveAnonymousReadinessDraft(formData: FormData): Promise<{ token?: string; error?: string }> {
  const rawResponses = String(formData.get("responsesJson") ?? "");
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawResponses);
  } catch {
    return { error: "invalid-responses" };
  }

  const partial = parsePartialReadinessResponses(parsedJson);
  if ("error" in partial) return { error: partial.error };

  const existingToken = String(formData.get("draftToken") ?? "").trim();
  const token = existingToken || createDraftToken();
  const encrypted = encryptDraftResponses(partial.responses);
  const service = createServiceClient();
  const payload = {
    token_hash: hashDraftToken(token),
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    auth_tag: encrypted.authTag,
    assessment_version: READINESS_ASSESSMENT_VERSION,
    expires_at: draftExpiresAt(),
  };

  if (existingToken) {
    const { data: existing } = await service
      .from("readiness_assessment_drafts")
      .select("id, claimed_at, expires_at")
      .eq("token_hash", hashDraftToken(existingToken))
      .maybeSingle();
    if (existing && !existing.claimed_at && new Date(existing.expires_at).getTime() > Date.now()) {
      const { error } = await service.from("readiness_assessment_drafts").update(payload).eq("id", existing.id);
      if (error) return { error: "save-failed" };
      return { token };
    }
  }

  const { error } = await service.from("readiness_assessment_drafts").insert(payload);
  if (error) return { error: "save-failed" };
  return { token };
}

export async function claimReadinessDraft(formData: FormData) {
  const draftToken = String(formData.get("draftToken") ?? "").trim();
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") ?? `${PORTAL_REDIRECT}?resume=1`),
    ["/portal/"],
    `${PORTAL_REDIRECT}?resume=1`,
  );
  if (!draftToken) redirect(`${redirectTo}?error=invalid-responses`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/portal/login/?next=${encodeURIComponent(redirectTo)}`);

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") redirect("/portal/");

  const clientProfile = await ensureMinimalClientProfile(user.id);
  if (!clientProfile) redirect(`${redirectTo}?error=save-failed`);

  const service = createServiceClient();
  const { data: draft } = await service
    .from("readiness_assessment_drafts")
    .select("*")
    .eq("token_hash", hashDraftToken(draftToken))
    .maybeSingle();

  if (!draft || draft.claimed_at || new Date(draft.expires_at).getTime() <= Date.now()) {
    redirect(`${redirectTo}?error=draft-expired`);
  }

  let responses: ReadinessResponses;
  try {
    responses = decryptDraftResponses({
      ciphertext: draft.ciphertext,
      iv: draft.iv,
      authTag: draft.auth_tag,
    });
  } catch {
    redirect(`${redirectTo}?error=invalid-responses`);
  }

  const parsed = parseReadinessResponses(responses, { requireComplete: true });
  if ("error" in parsed) {
    // Keep draft usable; store as incomplete portal progress via soft redirect.
    redirect(`${redirectTo}?error=${parsed.error}&draft=1`);
  }

  const saved = await persistCompletedAssessment({
    clientProfileId: clientProfile.id,
    responses: parsed.responses,
    scores: parsed.scores,
  });
  if ("error" in saved) redirect(`${redirectTo}?error=save-failed`);

  await service
    .from("readiness_assessment_drafts")
    .update({
      claimed_at: new Date().toISOString(),
      client_profile_id: clientProfile.id,
    })
    .eq("id", draft.id);

  revalidatePath("/portal/readiness/");
  revalidatePath("/portal/");
  revalidatePath(`/admin/clients/${clientProfile.id}/`);
  revalidatePath(`/admin/clients/${clientProfile.id}/readiness/`);
  redirect(`${PORTAL_REDIRECT}?completed=1`);
}

export async function saveReadinessAssessment(formData: FormData) {
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") ?? PORTAL_REDIRECT),
    ["/portal/"],
    PORTAL_REDIRECT,
  );
  const action = String(formData.get("action") ?? "submit");
  const rawResponses = String(formData.get("responsesJson") ?? "");

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawResponses);
  } catch {
    redirect(`${redirectTo}?error=invalid-responses`);
  }

  const requireComplete = action === "submit";
  const parsed = parseReadinessResponses(parsedJson, { requireComplete });
  if ("error" in parsed) {
    redirect(`${redirectTo}?error=${parsed.error}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/portal/login/?next=${encodeURIComponent(redirectTo)}`);

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") redirect("/portal/");

  const clientProfile = await ensureMinimalClientProfile(user.id);
  if (!clientProfile) redirect(`${redirectTo}?error=save-failed`);

  if (action === "submit") {
    const saved = await persistCompletedAssessment({
      clientProfileId: clientProfile.id,
      responses: parsed.responses,
      scores: parsed.scores,
    });
    if ("error" in saved) redirect(`${redirectTo}?error=save-failed`);
    revalidatePath("/portal/readiness/");
    revalidatePath("/portal/");
    revalidatePath(`/admin/clients/${clientProfile.id}/`);
    revalidatePath(`/admin/clients/${clientProfile.id}/readiness/`);
    redirect(`${redirectTo}?completed=1`);
  }

  // Partial draft save on authenticated profile: upsert current incomplete row.
  const { data: current } = await supabase
    .from("readiness_assessments")
    .select("id, completed_at")
    .eq("client_profile_id", clientProfile.id)
    .eq("is_current", true)
    .maybeSingle();

  if (current?.completed_at) {
    // Start a new in-progress draft attempt without marking complete.
    await supabase.from("readiness_assessments").update({ is_current: false }).eq("id", current.id);
    const { data: previous } = await supabase
      .from("readiness_assessments")
      .select("attempt_number")
      .eq("client_profile_id", clientProfile.id)
      .order("attempt_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = await supabase.from("readiness_assessments").insert({
      client_profile_id: clientProfile.id,
      assessment_version: READINESS_ASSESSMENT_VERSION,
      responses: parsed.responses,
      commitment_score: parsed.scores.commitment,
      self_awareness_score: parsed.scores.self_awareness,
      emotional_capacity_score: parsed.scores.emotional_capacity,
      readiness_product: parsed.scores.readinessProduct,
      readiness_index: parsed.scores.readinessIndex,
      readiness_band: parsed.scores.readinessBand,
      focus_areas: parsed.scores.focusAreas,
      attempt_number: (previous?.attempt_number ?? 0) + 1,
      is_current: true,
      urgent_safety: parsed.scores.urgentSafety,
      next_step: parsed.scores.nextStep,
      completed_at: null,
    });
    if (error) redirect(`${redirectTo}?error=save-failed`);
  } else if (current) {
    const { error } = await supabase
      .from("readiness_assessments")
      .update({
        responses: parsed.responses,
        commitment_score: parsed.scores.commitment,
        self_awareness_score: parsed.scores.self_awareness,
        emotional_capacity_score: parsed.scores.emotional_capacity,
        readiness_product: parsed.scores.readinessProduct,
        readiness_index: parsed.scores.readinessIndex,
        readiness_band: parsed.scores.readinessBand,
        focus_areas: parsed.scores.focusAreas,
        urgent_safety: parsed.scores.urgentSafety,
        next_step: parsed.scores.nextStep,
        assessment_version: READINESS_ASSESSMENT_VERSION,
      })
      .eq("id", current.id);
    if (error) redirect(`${redirectTo}?error=save-failed`);
  } else {
    const { error } = await supabase.from("readiness_assessments").insert({
      client_profile_id: clientProfile.id,
      assessment_version: READINESS_ASSESSMENT_VERSION,
      responses: parsed.responses,
      commitment_score: parsed.scores.commitment,
      self_awareness_score: parsed.scores.self_awareness,
      emotional_capacity_score: parsed.scores.emotional_capacity,
      readiness_product: parsed.scores.readinessProduct,
      readiness_index: parsed.scores.readinessIndex,
      readiness_band: parsed.scores.readinessBand,
      focus_areas: parsed.scores.focusAreas,
      attempt_number: 1,
      is_current: true,
      urgent_safety: parsed.scores.urgentSafety,
      next_step: parsed.scores.nextStep,
      completed_at: null,
    });
    if (error) redirect(`${redirectTo}?error=save-failed`);
  }

  revalidatePath("/portal/readiness/");
  redirect(`${redirectTo}?saved=1`);
}

export async function saveAdminReadinessReview(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const assessmentId = sanitizeUuid(String(formData.get("assessmentId") ?? ""));
  const notes = normalizeMultiline(String(formData.get("practitionerNotes") ?? "")).slice(0, dashboardFieldMaxLengths.noteBody);
  const reviewStatus = String(formData.get("reviewStatus") ?? "unreviewed") as ReadinessReviewStatus;
  const recommendedFocus = String(formData.get("recommendedFocus") ?? "").trim() as ReadinessFoundationId | ReadinessNextStep | "";
  const followUpOn = String(formData.get("followUpOn") ?? "").trim();
  const redirectTo = clientProfileId ? `/admin/clients/${clientProfileId}/readiness/` : "/admin/clients/";

  if (!clientProfileId || !assessmentId) redirect(redirectTo);
  if (!["unreviewed", "in_review", "reviewed", "follow_up_needed"].includes(reviewStatus)) {
    redirect(`${redirectTo}?error=save-failed`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/login/");

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("readiness_assessments")
    .update({
      practitioner_notes: notes || null,
      review_status: reviewStatus,
      recommended_focus: recommendedFocus || null,
      follow_up_on: /^\d{4}-\d{2}-\d{2}$/.test(followUpOn) ? followUpOn : null,
      reviewed_at: reviewStatus === "reviewed" || reviewStatus === "follow_up_needed" ? now : null,
      reviewed_by: reviewStatus === "reviewed" || reviewStatus === "follow_up_needed" ? user.id : null,
    })
    .eq("id", assessmentId)
    .eq("client_profile_id", clientProfileId);

  if (error) redirect(`${redirectTo}?error=save-failed`);

  revalidatePath(redirectTo);
  revalidatePath(`/admin/clients/${clientProfileId}/`);
  redirect(`${redirectTo}?notesSaved=1`);
}

export async function ensureMinimalClientProfileAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") return null;
  return ensureMinimalClientProfile(user.id);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  computeConsultationPercent,
  CONSULTATION_STEP_KEYS,
  getConsultationStep,
  isConsultationCompleteStatus,
  validateStepResponses,
  type ConsultationStepKey,
} from "@/lib/consultation/schema";
import { sendConsultationFormEmail } from "@/lib/email/consultationEmail";
import { ensureClientConsultation, getClientConsultation } from "@/lib/dashboard/queries";
import { normalizeMultiline, normalizeSingleLine, sanitizeUuid } from "@/lib/dashboard/formValidation";
import { absoluteUrl } from "@/lib/constants";
import { logAuditEvent } from "@/lib/supabase/audit";
import { getClientProfileForUser } from "@/lib/supabase/auth";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ConsultationStatus } from "@/types/database";

const PORTAL_CONSULTATION = "/portal/consultation/";
const ALLOWED_UPLOAD_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

function mergeStepResponses(
  existing: Record<string, unknown>,
  stepKey: ConsultationStepKey,
  incoming: Record<string, unknown>,
) {
  const step = getConsultationStep(stepKey);
  if (!step) return existing;

  const next = { ...existing };
  for (const field of step.fields) {
    if (field.key in incoming) {
      next[field.key] = incoming[field.key];
    }
    if (field.otherKey && field.otherKey in incoming) {
      next[field.otherKey] = incoming[field.otherKey];
    }
  }
  return next;
}

function parseIncomingResponses(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

function nextStatusAfterSave(current: ConsultationStatus, completing: boolean, mode: "online" | "upload" | null): ConsultationStatus {
  if (completing) return mode === "upload" ? "uploaded" : "completed";
  if (current === "not_sent" || current === "sent" || current === "delivered" || current === "opened") {
    return "started";
  }
  if (current === "started") return "in_progress";
  return current;
}

async function requireClientProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") redirect("/portal/login/");

  const clientProfile = await getClientProfileForUser(user.id);
  if (!clientProfile?.onboarding_completed_at) redirect("/portal/onboarding/");

  return { supabase, user, clientProfile };
}

export async function markConsultationStarted() {
  const { supabase, clientProfile } = await requireClientProfile();
  const consultation = await ensureClientConsultation(clientProfile.id);
  if (!consultation || isConsultationCompleteStatus(consultation.status)) {
    return { ok: true as const };
  }

  const now = new Date().toISOString();
  const patch: {
    started_at?: string;
    status?: ConsultationStatus;
  } = {};

  if (!consultation.started_at) {
    patch.started_at = now;
  }

  if (consultation.status === "not_sent" || consultation.status === "sent" || consultation.status === "delivered" || consultation.status === "opened") {
    patch.status = "started";
  }

  if (Object.keys(patch).length) {
    await supabase.from("client_consultations").update(patch).eq("id", consultation.id);
  }

  return { ok: true as const };
}

export async function saveConsultationStep(input: {
  stepKey: string;
  responses: Record<string, unknown>;
  action: "save" | "continue" | "submit";
}) {
  const { supabase, clientProfile } = await requireClientProfile();
  const stepKey = input.stepKey as ConsultationStepKey;
  const step = getConsultationStep(stepKey);
  if (!step || !CONSULTATION_STEP_KEYS.includes(stepKey)) {
    return { ok: false as const, error: "invalid-step" };
  }

  const incoming = parseIncomingResponses(input.responses);
  if (!incoming) {
    return { ok: false as const, error: "invalid-payload" };
  }

  const consultation = await ensureClientConsultation(clientProfile.id);
  if (!consultation) {
    return { ok: false as const, error: "save-failed" };
  }

  if (isConsultationCompleteStatus(consultation.status) && consultation.completion_mode === "online") {
    return { ok: false as const, error: "already-completed" };
  }

  if (input.action !== "save") {
    const missing = validateStepResponses(step, { ...consultation.responses, ...incoming });
    if (missing.length) {
      return { ok: false as const, error: "incomplete-step", missing };
    }
  }

  const merged = mergeStepResponses(consultation.responses, stepKey, incoming);
  const percent = computeConsultationPercent(merged);
  const stepIndex = CONSULTATION_STEP_KEYS.indexOf(stepKey);
  const isLastStep = stepIndex === CONSULTATION_STEP_KEYS.length - 1;
  const completing = input.action === "submit" && isLastStep;
  const now = new Date().toISOString();

  let nextStep = consultation.current_step;
  if (input.action === "continue" && !isLastStep) {
    nextStep = CONSULTATION_STEP_KEYS[stepIndex + 1];
  } else if (completing) {
    nextStep = stepKey;
  } else {
    nextStep = stepKey;
  }

  const status = nextStatusAfterSave(consultation.status, completing, completing ? "online" : null);
  const signatureName =
    typeof merged.signature_name === "string" ? normalizeSingleLine(merged.signature_name) : consultation.signature_name;

  const { error } = await supabase
    .from("client_consultations")
    .update({
      responses: merged,
      current_step: nextStep,
      percent_complete: completing ? 100 : percent,
      status,
      started_at: consultation.started_at ?? now,
      completed_at: completing ? now : consultation.completed_at,
      completion_mode: completing ? "online" : consultation.completion_mode,
      signature_name: signatureName || null,
      signed_at: completing ? now : consultation.signed_at,
    })
    .eq("id", consultation.id);

  if (error) {
    return { ok: false as const, error: "save-failed" };
  }

  revalidatePath(PORTAL_CONSULTATION);
  revalidatePath("/portal/");
  revalidatePath(`/admin/clients/${clientProfile.id}/`);
  revalidatePath(`/admin/clients/${clientProfile.id}/consultation/`);

  return {
    ok: true as const,
    nextStep,
    percentComplete: completing ? 100 : percent,
    completed: completing,
  };
}

export async function uploadCompletedConsultationForm(formData: FormData) {
  const { supabase, user, clientProfile } = await requireClientProfile();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`${PORTAL_CONSULTATION}?error=missing-file`);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    redirect(`${PORTAL_CONSULTATION}?error=file-too-large`);
  }

  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    redirect(`${PORTAL_CONSULTATION}?error=invalid-file-type`);
  }

  const consultation = await ensureClientConsultation(clientProfile.id);
  if (!consultation) {
    redirect(`${PORTAL_CONSULTATION}?error=save-failed`);
  }

  const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  const path = `consultations/${clientProfile.id}/completed-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("client-documents").upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    redirect(`${PORTAL_CONSULTATION}?error=upload-failed`);
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("client_consultations")
    .update({
      status: "uploaded",
      completion_mode: "upload",
      completed_at: now,
      started_at: consultation.started_at ?? now,
      percent_complete: 100,
      upload_storage_path: path,
      upload_file_name: normalizeSingleLine(file.name).slice(0, 200) || `consultation.${extension}`,
      upload_mime_type: file.type,
    })
    .eq("id", consultation.id);

  if (error) {
    redirect(`${PORTAL_CONSULTATION}?error=save-failed`);
  }

  await logAuditEvent({
    userId: user.id,
    action: "consultation_upload",
    resourceType: "client_consultation",
    resourceId: consultation.id,
    metadata: { path },
  });

  revalidatePath(PORTAL_CONSULTATION);
  revalidatePath(`/admin/clients/${clientProfile.id}/consultation/`);
  redirect(`${PORTAL_CONSULTATION}?uploaded=1`);
}

export async function sendConsultationInvite(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  if (!clientProfileId) redirect("/admin/clients/");

  const supabase = await createClient();
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();
  if (!adminUser) redirect("/admin/login/");

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", adminUser.id).single();
  if (adminProfile?.role !== "admin") redirect("/admin/login/");

  if (!isSupabaseServiceConfigured()) {
    redirect(`/admin/clients/${clientProfileId}/consultation/?error=email-not-configured`);
  }

  const service = createServiceClient();
  const { data: clientProfile } = await service.from("client_profiles").select("*").eq("id", clientProfileId).single();
  if (!clientProfile) redirect("/admin/clients/?error=client-not-found");

  const { data: profile } = await service
    .from("profiles")
    .select("full_name")
    .eq("id", clientProfile.user_id)
    .single();

  const { data: authUser } = await service.auth.admin.getUserById(clientProfile.user_id);
  const email = authUser.user?.email;
  if (!email) {
    redirect(`/admin/clients/${clientProfileId}/consultation/?error=missing-email`);
  }

  let consultation = await getClientConsultation(clientProfileId);
  if (!consultation) {
    const { data: created, error: createError } = await service
      .from("client_consultations")
      .insert({
        client_profile_id: clientProfileId,
        status: "not_sent",
        current_step: "personal",
        percent_complete: 0,
        responses: {},
      })
      .select("*")
      .single();

    if (createError || !created) {
      redirect(`/admin/clients/${clientProfileId}/consultation/?error=save-failed`);
    }
    consultation = { ...created, responses: (created.responses ?? {}) as Record<string, unknown> };
  }

  const portalUrl = absoluteUrl("/portal/consultation/");
  const sendResult = await sendConsultationFormEmail({
    to: email,
    clientName: profile?.full_name ?? "there",
    portalUrl,
  });

  if (!sendResult.ok) {
    redirect(`/admin/clients/${clientProfileId}/consultation/?error=${encodeURIComponent(sendResult.error)}`);
  }

  const now = new Date().toISOString();
  await service
    .from("client_consultations")
    .update({
      status:
        consultation.status === "completed" || consultation.status === "uploaded" || consultation.status === "in_progress" || consultation.status === "started"
          ? consultation.status
          : "sent",
      sent_at: now,
      resend_email_id: sendResult.emailId ?? consultation.resend_email_id,
    })
    .eq("id", consultation.id);

  await logAuditEvent({
    userId: adminUser.id,
    action: "consultation_send",
    resourceType: "client_consultation",
    resourceId: consultation.id,
    metadata: { email, emailId: sendResult.emailId ?? null },
  });

  revalidatePath(`/admin/clients/${clientProfileId}/`);
  revalidatePath(`/admin/clients/${clientProfileId}/consultation/`);
  revalidatePath("/admin/clients/");
  redirect(`/admin/clients/${clientProfileId}/consultation/?sent=1`);
}

export async function savePractitionerConsultationNotes(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const notes = normalizeMultiline(String(formData.get("practitionerNotes") ?? "")).slice(0, 5000);
  const markReviewed = String(formData.get("markReviewed") ?? "") === "1";

  if (!clientProfileId) redirect("/admin/clients/");

  const supabase = await createClient();
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();
  if (!adminUser) redirect("/admin/login/");

  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", adminUser.id).single();
  if (adminProfile?.role !== "admin") redirect("/admin/login/");

  const consultation = await ensureClientConsultation(clientProfileId);
  if (!consultation) {
    redirect(`/admin/clients/${clientProfileId}/consultation/?error=save-failed`);
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("client_consultations")
    .update({
      practitioner_notes: notes || null,
      ...(markReviewed
        ? {
            practitioner_reviewed_at: now,
            practitioner_reviewed_by: adminUser.id,
          }
        : {}),
    })
    .eq("id", consultation.id);

  if (error) {
    redirect(`/admin/clients/${clientProfileId}/consultation/?error=save-failed`);
  }

  revalidatePath(`/admin/clients/${clientProfileId}/consultation/`);
  redirect(`/admin/clients/${clientProfileId}/consultation/?notesSaved=1`);
}

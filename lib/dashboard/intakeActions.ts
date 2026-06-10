"use server";

import { redirect } from "next/navigation";
import { flattenIntakeQuestions, getIntakeQuestionSetForAddiction } from "@/lib/intake/questions";
import {
  dashboardFieldMaxLengths,
  normalizeMultiline,
  sanitizeRedirectPath,
} from "@/lib/dashboard/formValidation";
import { getClientProfileForUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

const INTAKE_REDIRECT = "/portal/intake/";

function parseIntakeResponses(formData: FormData, questionIds: string[]) {
  const responses: Record<string, string> = {};

  for (const questionId of questionIds) {
    const value = normalizeMultiline(String(formData.get(`response_${questionId}`) ?? ""));
    if (value.length > dashboardFieldMaxLengths.intakeResponse) {
      return null;
    }
    responses[questionId] = value;
  }

  return responses;
}

export async function saveIntakeForm(formData: FormData) {
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? INTAKE_REDIRECT), ["/portal/"], INTAKE_REDIRECT);
  const action = String(formData.get("action") ?? "save");
  const questionSetSlug = String(formData.get("questionSetSlug") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") redirect("/portal/login/");

  const clientProfile = await getClientProfileForUser(user.id);
  if (!clientProfile?.addiction_slug) redirect(`${redirectTo}?error=missing-focus`);

  const questionSet = getIntakeQuestionSetForAddiction(clientProfile.addiction_slug);
  if (!questionSet || questionSet.slug !== questionSetSlug) redirect(`${redirectTo}?error=invalid-questions`);

  const questionIds = flattenIntakeQuestions(questionSet).map((question) => question.id);
  const responses = parseIntakeResponses(formData, questionIds);
  if (!responses) redirect(`${redirectTo}?error=response-too-long`);

  const { data: existing } = await supabase
    .from("client_intake_submissions")
    .select("id, completed_at")
    .eq("client_profile_id", clientProfile.id)
    .maybeSingle();

  if (existing?.completed_at) {
    redirect(`${redirectTo}?error=already-completed`);
  }

  if (action === "submit") {
    const unanswered = questionIds.filter((questionId) => !responses[questionId]?.trim());
    if (unanswered.length) {
      redirect(`${redirectTo}?error=incomplete`);
    }
  }

  const payload = {
    client_profile_id: clientProfile.id,
    question_set_slug: questionSet.slug,
    responses,
    completed_at: action === "submit" ? new Date().toISOString() : null,
  };

  if (existing) {
    const { error } = await supabase.from("client_intake_submissions").update(payload).eq("id", existing.id);
    if (error) redirect(`${redirectTo}?error=save-failed`);
  } else {
    const { error } = await supabase.from("client_intake_submissions").insert(payload);
    if (error) redirect(`${redirectTo}?error=save-failed`);
  }

  if (action === "submit") {
    redirect(`${redirectTo}?completed=1`);
  }

  redirect(`${redirectTo}?saved=1`);
}

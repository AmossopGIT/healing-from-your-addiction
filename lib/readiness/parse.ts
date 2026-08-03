import {
  computeReadinessScores,
  isAssessmentComplete,
  readinessFoundations,
  readinessGateQuestions,
  readinessSafetyQuestions,
  type ReadinessResponses,
} from "@/content/readinessAssessment";
import { dashboardFieldMaxLengths, normalizeMultiline } from "@/lib/dashboard/formValidation";

export type ParsedReadinessPayload = {
  responses: ReadinessResponses;
  scores: ReturnType<typeof computeReadinessScores>;
};

function parseSafetyValue(value: unknown): boolean | null {
  if (value === true || value === "yes" || value === "1" || value === "true") return true;
  if (value === false || value === "no" || value === "0" || value === "false") return false;
  return null;
}

export function parsePartialReadinessResponses(raw: unknown): { responses: ReadinessResponses } | { error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "invalid-responses" };
  }

  const source = raw as Record<string, unknown>;
  const responses: ReadinessResponses = {};

  for (const foundation of readinessFoundations) {
    for (const item of foundation.scaleItems) {
      if (!(item.id in source) || source[item.id] === null || source[item.id] === "") continue;
      const value = Number(source[item.id]);
      if (!Number.isInteger(value) || value < 1 || value > 10) {
        return { error: "invalid-responses" };
      }
      responses[item.id] = value;
    }
  }

  for (const item of readinessGateQuestions) {
    if (!(item.id in source) || source[item.id] === null || source[item.id] === "") continue;
    if (item.kind === "yes_no") {
      const value = String(source[item.id] ?? "").trim().toLowerCase();
      if (value !== "yes" && value !== "no") return { error: "invalid-responses" };
      responses[item.id] = value;
      continue;
    }
    const text = normalizeMultiline(String(source[item.id] ?? ""));
    if (text.length > dashboardFieldMaxLengths.intakeResponse) {
      return { error: "response-too-long" };
    }
    if (text) responses[item.id] = text;
  }

  for (const item of readinessSafetyQuestions) {
    if (!(item.id in source) || source[item.id] === null || source[item.id] === "") continue;
    const parsed = parseSafetyValue(source[item.id]);
    if (parsed === null) return { error: "invalid-responses" };
    responses[item.id] = parsed;
  }

  if ("privacy_consent" in source && source.privacy_consent !== null && source.privacy_consent !== "") {
    const consent = parseSafetyValue(source.privacy_consent);
    if (consent === null) return { error: "invalid-responses" };
    responses.privacy_consent = consent;
  }

  return { responses };
}

export function parseReadinessResponses(
  raw: unknown,
  options?: { requireComplete?: boolean },
): ParsedReadinessPayload | { error: string } {
  const requireComplete = options?.requireComplete ?? true;
  const partial = parsePartialReadinessResponses(raw);
  if ("error" in partial) return partial;

  if (requireComplete && !isAssessmentComplete(partial.responses)) {
    return { error: "incomplete" };
  }

  return {
    responses: partial.responses,
    scores: computeReadinessScores(partial.responses),
  };
}

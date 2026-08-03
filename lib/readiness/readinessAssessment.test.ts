import { describe, expect, it } from "vitest";
import {
  computeReadinessScores,
  hasUrgentSafety,
  isAssessmentComplete,
  readinessFoundations,
  readinessGateQuestions,
  readinessSafetyQuestions,
} from "@/content/readinessAssessment";
import { createDraftToken, decryptDraftResponses, encryptDraftResponses, hashDraftToken } from "@/lib/readiness/draftCrypto";
import { parsePartialReadinessResponses, parseReadinessResponses } from "@/lib/readiness/parse";

function completeResponses() {
  const responses: Record<string, number | string | boolean> = {};
  for (const foundation of readinessFoundations) {
    for (const item of foundation.scaleItems) {
      responses[item.id] = item.isOverall
        ? item.foundationId === "commitment"
          ? 8
          : 9
        : item.foundationId === "emotional_capacity"
          ? 2
          : 9;
    }
  }
  responses.gate_commitment = "yes";
  responses.gate_awareness = "It numbs loneliness and shame after stressful days.";
  responses.gate_emotion = "yes";
  for (const item of readinessSafetyQuestions) {
    responses[item.id] = false;
  }
  responses.privacy_consent = true;
  return responses;
}

describe("readiness assessment hardening", () => {
  it("loads foundations, gates, and safety questions", () => {
    expect(readinessFoundations).toHaveLength(3);
    expect(readinessFoundations.flatMap((foundation) => foundation.scaleItems.filter((item) => !item.isOverall))).toHaveLength(15);
    expect(readinessGateQuestions).toHaveLength(3);
    expect(readinessSafetyQuestions).toHaveLength(4);
  });

  it("scores only non-overall items and normalizes readiness index", () => {
    const scores = computeReadinessScores(completeResponses());
    expect(scores.commitment).toBe(9);
    expect(scores.self_awareness).toBe(9);
    expect(scores.emotional_capacity).toBe(2);
    expect(scores.readinessProduct).toBe(162);
    expect(scores.readinessIndex).toBe(16.2);
    expect(scores.readinessBand).toBe("needs_support_first");
    expect(scores.focusAreas).toEqual(["emotional_capacity"]);
    expect(scores.nextStep).toBe("emotional_regulation");
  });

  it("lets gate no answers force support focus even with high scores", () => {
    const responses = completeResponses();
    for (const foundation of readinessFoundations) {
      for (const item of foundation.scaleItems) {
        responses[item.id] = 9;
      }
    }
    responses.gate_commitment = "no";
    responses.gate_emotion = "yes";
    const scores = computeReadinessScores(responses);
    expect(scores.focusAreas).toContain("commitment");
    expect(scores.nextStep).toBe("motivation_work");
    expect(scores.readinessBand).not.toBe("fully_ready");
  });

  it("flags urgent safety and routes next step", () => {
    const responses = completeResponses();
    responses.safety_danger = true;
    expect(hasUrgentSafety(responses)).toBe(true);
    expect(computeReadinessScores(responses).nextStep).toBe("urgent_safety");
  });

  it("supports partial and complete parsing", () => {
    const partial = parsePartialReadinessResponses({ commitment_choose: 8 });
    expect("error" in partial).toBe(false);
    if ("error" in partial) return;
    expect(partial.responses.commitment_choose).toBe(8);

    expect(parseReadinessResponses({ commitment_choose: 8 })).toEqual({ error: "incomplete" });
    const complete = parseReadinessResponses(completeResponses());
    expect("error" in complete).toBe(false);
  });

  it("requires privacy consent for completion", () => {
    const responses = completeResponses();
    delete responses.privacy_consent;
    expect(isAssessmentComplete(responses)).toBe(false);
  });

  it("encrypts and decrypts draft payloads with hashed tokens", () => {
    process.env.READINESS_DRAFT_SECRET = "test-readiness-draft-secret";
    const token = createDraftToken();
    const hash = hashDraftToken(token);
    expect(hash).toHaveLength(64);
    const encrypted = encryptDraftResponses(completeResponses());
    const decrypted = decryptDraftResponses(encrypted);
    expect(decrypted.gate_commitment).toBe("yes");
    expect(decrypted.commitment_choose).toBe(9);
  });
});

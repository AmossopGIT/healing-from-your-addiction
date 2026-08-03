export type ReadinessFoundationId = "commitment" | "self_awareness" | "emotional_capacity";

export type ReadinessBand = "needs_support_first" | "developing" | "mostly_ready" | "fully_ready";

export type ReadinessReviewStatus = "unreviewed" | "in_review" | "reviewed" | "follow_up_needed";

export type ReadinessNextStep =
  | "programme_enquiry"
  | "motivation_work"
  | "trigger_mapping"
  | "emotional_regulation"
  | "urgent_safety";

export type ReadinessScaleItem = {
  id: string;
  foundationId: ReadinessFoundationId;
  label: string;
  isOverall?: boolean;
};

export type ReadinessGateItem = {
  id: string;
  foundationId: ReadinessFoundationId;
  label: string;
  kind: "yes_no" | "textarea";
  hint?: string;
};

export type ReadinessSafetyItem = {
  id: string;
  label: string;
  detail: string;
};

export type ReadinessFoundation = {
  id: ReadinessFoundationId;
  title: string;
  eyebrow: string;
  intro: string;
  overallPrompt: string;
  scaleItems: ReadinessScaleItem[];
};

export const READINESS_ASSESSMENT_VERSION = 2;
export const READINESS_DRAFT_STORAGE_KEY = "hfya_readiness_assessment_draft_v2";
export const READINESS_DRAFT_TOKEN_KEY = "hfya_readiness_draft_token_v2";
export const READINESS_SCORE_THRESHOLD = 7;
export const READINESS_COMMITMENT_OVERALL_THRESHOLD = 8;
export const READINESS_RETENTION_YEARS = 7;
export const READINESS_DRAFT_TTL_HOURS = 72;

export const readinessScaleLabels = {
  low: "1–3 = This area may need support first",
  mid: "4–6 = Developing",
  high: "7–8 = Mostly ready",
  full: "9–10 = Fully ready",
} as const;

export const readinessFoundations: ReadinessFoundation[] = [
  {
    id: "commitment",
    title: "Commitment",
    eyebrow: "Foundation 1",
    intro:
      "Healing support works best when recovery is chosen because you genuinely want it — not only because someone else wants it for you.",
    overallPrompt: "On a scale from 1–10, how committed am I to healing?",
    scaleItems: [
      {
        id: "commitment_choose",
        foundationId: "commitment",
        label: "Am I choosing recovery because I genuinely want it, rather than because someone else wants me to?",
      },
      {
        id: "commitment_lifestyle",
        foundationId: "commitment",
        label: "Am I willing to make difficult lifestyle changes?",
      },
      {
        id: "commitment_long_term",
        foundationId: "commitment",
        label: "Am I prepared to give up the short-term comfort of my addiction for long-term freedom?",
      },
      {
        id: "commitment_cravings",
        foundationId: "commitment",
        label: "Am I willing to remain committed even when I experience cravings?",
      },
      {
        id: "commitment_responsibility",
        foundationId: "commitment",
        label: "Am I willing to take responsibility for my own recovery?",
      },
      {
        id: "commitment_overall",
        foundationId: "commitment",
        label: "On a scale from 1–10, how committed am I to healing?",
        isOverall: true,
      },
    ],
  },
  {
    id: "self_awareness",
    title: "Self-Awareness",
    eyebrow: "Foundation 2",
    intro:
      "Self-awareness helps map triggers, avoided emotions, and excuses. Without it, forward movement can feel unclear.",
    overallPrompt: "How well do I understand why I became addicted?",
    scaleItems: [
      {
        id: "awareness_triggers",
        foundationId: "self_awareness",
        label: "Can I identify what usually triggers my addiction?",
      },
      {
        id: "awareness_avoided_emotions",
        foundationId: "self_awareness",
        label: "Do I know what emotions I am trying to avoid?",
      },
      {
        id: "awareness_preceding_thoughts",
        foundationId: "self_awareness",
        label: "Can I recognise the thoughts that precede my addictive behaviour?",
      },
      {
        id: "awareness_consequences",
        foundationId: "self_awareness",
        label: "Am I honest with myself about the consequences of my addiction?",
      },
      {
        id: "awareness_excuses",
        foundationId: "self_awareness",
        label: "Can I admit when I am making excuses?",
      },
      {
        id: "awareness_overall",
        foundationId: "self_awareness",
        label: "How well do I understand why I became addicted?",
        isOverall: true,
      },
    ],
  },
  {
    id: "emotional_capacity",
    title: "Emotional Capacity",
    eyebrow: "Foundation 3",
    intro:
      "A large part of addiction is disconnection from feeling. Emotional capacity is the willingness to feel discomfort without escaping.",
    overallPrompt: "When emotional pain appears, do I run from it or move through it?",
    scaleItems: [
      {
        id: "emotion_sit_with",
        foundationId: "emotional_capacity",
        label: "Can I sit with emotional discomfort without immediately escaping?",
      },
      {
        id: "emotion_tolerate",
        foundationId: "emotional_capacity",
        label: "Can I tolerate sadness, loneliness, frustration, or anxiety without acting impulsively?",
      },
      {
        id: "emotion_willing_pain",
        foundationId: "emotional_capacity",
        label: "Am I willing to experience painful emotions if they lead to healing?",
      },
      {
        id: "emotion_identify",
        foundationId: "emotional_capacity",
        label: "Can I identify what I am feeling?",
      },
      {
        id: "emotion_believe_tolerable",
        foundationId: "emotional_capacity",
        label: "Do I believe emotions can be tolerated instead of avoided?",
      },
      {
        id: "emotion_overall",
        foundationId: "emotional_capacity",
        label: "When emotional pain appears, how ready am I to move through it instead of running from it?",
        isOverall: true,
      },
    ],
  },
];

export const readinessGateQuestions: ReadinessGateItem[] = [
  {
    id: "gate_commitment",
    foundationId: "commitment",
    label: "If healing becomes difficult, will you continue anyway?",
    kind: "yes_no",
    hint: "A ready client answers yes — even when the path is hard.",
  },
  {
    id: "gate_awareness",
    foundationId: "self_awareness",
    label: "Can you clearly explain what your addiction is doing for you emotionally?",
    kind: "textarea",
    hint: "For example: escaping loneliness, numbing shame, managing anxiety, or avoiding painful memories.",
  },
  {
    id: "gate_emotion",
    foundationId: "emotional_capacity",
    label: "Are you willing to experience emotional pain without escaping into your addiction?",
    kind: "yes_no",
    hint: "Recovery begins the moment the answer becomes: Yes. I am willing.",
  },
];

export const readinessSafetyQuestions: ReadinessSafetyItem[] = [
  {
    id: "safety_detox",
    label: "Do you currently need medical detox or medically supervised withdrawal support?",
    detail: "Substance withdrawal can be medically dangerous. Seek appropriate medical care first if detox is needed.",
  },
  {
    id: "safety_psychiatric",
    label: "Do you currently need urgent psychiatric care?",
    detail: "If you are in acute psychiatric distress, contact emergency or psychiatric services immediately.",
  },
  {
    id: "safety_emergency",
    label: "Do you currently need emergency medical help?",
    detail: "Call your local emergency number if you need immediate medical assistance.",
  },
  {
    id: "safety_danger",
    label: "Are you in immediate danger or having thoughts of harming yourself or someone else?",
    detail: "If you are in immediate danger, contact emergency services now. This assessment is not crisis care.",
  },
];

export const readinessBandLabels: Record<ReadinessBand, string> = {
  needs_support_first: "This area may need support first",
  developing: "Developing",
  mostly_ready: "Mostly ready",
  fully_ready: "Fully ready",
};

export const readinessFoundationLabels: Record<ReadinessFoundationId, string> = {
  commitment: "Commitment",
  self_awareness: "Self-Awareness",
  emotional_capacity: "Emotional Capacity",
};

export const readinessNextStepLabels: Record<ReadinessNextStep, string> = {
  programme_enquiry: "Explore a confidential programme enquiry",
  motivation_work: "Begin with motivation and commitment support",
  trigger_mapping: "Begin with trigger and pattern mapping",
  emotional_regulation: "Begin with emotional regulation support",
  urgent_safety: "Seek urgent medical or emergency support first",
};

export const readinessReviewStatusLabels: Record<ReadinessReviewStatus, string> = {
  unreviewed: "Unreviewed",
  in_review: "In review",
  reviewed: "Reviewed",
  follow_up_needed: "Follow-up needed",
};

export type ReadinessResponses = Record<string, number | string | boolean>;

export type ReadinessScores = {
  commitment: number;
  self_awareness: number;
  emotional_capacity: number;
  commitmentOverall: number | null;
  selfAwarenessOverall: number | null;
  emotionalCapacityOverall: number | null;
  readinessProduct: number;
  readinessIndex: number;
  readinessBand: ReadinessBand;
  focusAreas: ReadinessFoundationId[];
  sectionBands: Record<ReadinessFoundationId, ReadinessBand>;
  gateFlags: {
    commitmentNo: boolean;
    emotionNo: boolean;
    awarenessThin: boolean;
  };
  urgentSafety: boolean;
  nextStep: ReadinessNextStep;
};

export function scoreToBand(score: number): ReadinessBand {
  if (score >= 9) return "fully_ready";
  if (score >= 7) return "mostly_ready";
  if (score >= 4) return "developing";
  return "needs_support_first";
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function hasUrgentSafety(responses: ReadinessResponses) {
  return readinessSafetyQuestions.some((item) => responses[item.id] === true || responses[item.id] === "yes");
}

export function computeReadinessScores(responses: ReadinessResponses): ReadinessScores {
  const sectionScores = Object.fromEntries(
    readinessFoundations.map((foundation) => {
      const values = foundation.scaleItems
        .filter((item) => !item.isOverall)
        .map((item) => responses[item.id])
        .filter((value): value is number => typeof value === "number" && value >= 1 && value <= 10);
      return [foundation.id, average(values)] as const;
    }),
  ) as Record<ReadinessFoundationId, number>;

  const overallScores = Object.fromEntries(
    readinessFoundations.map((foundation) => {
      const overall = foundation.scaleItems.find((item) => item.isOverall);
      return [foundation.id, overall ? asNumber(responses[overall.id]) : null] as const;
    }),
  ) as Record<ReadinessFoundationId, number | null>;

  const focusAreas = new Set<ReadinessFoundationId>(
    (Object.keys(sectionScores) as ReadinessFoundationId[]).filter((id) => sectionScores[id] < READINESS_SCORE_THRESHOLD),
  );

  const gateFlags = {
    commitmentNo: responses.gate_commitment === "no",
    emotionNo: responses.gate_emotion === "no",
    awarenessThin:
      typeof responses.gate_awareness === "string" ? responses.gate_awareness.trim().length > 0 && responses.gate_awareness.trim().length < 24 : false,
  };

  if (gateFlags.commitmentNo || (overallScores.commitment !== null && overallScores.commitment < READINESS_COMMITMENT_OVERALL_THRESHOLD)) {
    focusAreas.add("commitment");
  }
  if (gateFlags.emotionNo) {
    focusAreas.add("emotional_capacity");
  }
  if (gateFlags.awarenessThin || (overallScores.self_awareness !== null && overallScores.self_awareness < READINESS_SCORE_THRESHOLD)) {
    focusAreas.add("self_awareness");
  }

  const product = sectionScores.commitment * sectionScores.self_awareness * sectionScores.emotional_capacity;
  const readinessIndex = Math.round((product / 1000) * 1000) / 10; // 0–100 scale from max 10*10*10
  const lowest = Math.min(sectionScores.commitment, sectionScores.self_awareness, sectionScores.emotional_capacity);
  let readinessBand = scoreToBand(lowest);

  if (gateFlags.commitmentNo || gateFlags.emotionNo) {
    readinessBand = readinessBand === "fully_ready" || readinessBand === "mostly_ready" ? "developing" : readinessBand;
  }

  if (
    readinessBand === "fully_ready" &&
    (overallScores.commitment === null || overallScores.commitment < READINESS_COMMITMENT_OVERALL_THRESHOLD || responses.gate_commitment !== "yes")
  ) {
    readinessBand = "mostly_ready";
  }

  const urgentSafety = hasUrgentSafety(responses);
  let nextStep: ReadinessNextStep = "programme_enquiry";
  if (urgentSafety) {
    nextStep = "urgent_safety";
  } else if (focusAreas.has("emotional_capacity")) {
    nextStep = "emotional_regulation";
  } else if (focusAreas.has("self_awareness")) {
    nextStep = "trigger_mapping";
  } else if (focusAreas.has("commitment")) {
    nextStep = "motivation_work";
  }

  return {
    commitment: sectionScores.commitment,
    self_awareness: sectionScores.self_awareness,
    emotional_capacity: sectionScores.emotional_capacity,
    commitmentOverall: overallScores.commitment,
    selfAwarenessOverall: overallScores.self_awareness,
    emotionalCapacityOverall: overallScores.emotional_capacity,
    readinessProduct: Math.round(product * 10) / 10,
    readinessIndex,
    readinessBand,
    focusAreas: Array.from(focusAreas),
    sectionBands: {
      commitment: scoreToBand(sectionScores.commitment),
      self_awareness: scoreToBand(sectionScores.self_awareness),
      emotional_capacity: scoreToBand(sectionScores.emotional_capacity),
    },
    gateFlags,
    urgentSafety,
    nextStep,
  };
}

export function isScaleComplete(responses: ReadinessResponses) {
  return readinessFoundations.every((foundation) =>
    foundation.scaleItems.every((item) => {
      const value = responses[item.id];
      return typeof value === "number" && value >= 1 && value <= 10;
    }),
  );
}

export function isGateComplete(responses: ReadinessResponses) {
  return readinessGateQuestions.every((item) => {
    const value = responses[item.id];
    if (item.kind === "yes_no") return value === "yes" || value === "no";
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function isSafetyComplete(responses: ReadinessResponses) {
  return readinessSafetyQuestions.every((item) => {
    const value = responses[item.id];
    return value === true || value === false || value === "yes" || value === "no";
  });
}

export function isAssessmentComplete(responses: ReadinessResponses) {
  return isScaleComplete(responses) && isGateComplete(responses) && isSafetyComplete(responses) && responses.privacy_consent === true;
}

export function getFocusGuidance(scores: ReadinessScores) {
  if (scores.urgentSafety) {
    return "Urgent safety needs appear to be present. Please seek appropriate medical, psychiatric, or emergency support before beginning intensive addiction pattern work.";
  }

  if (!scores.focusAreas.length) {
    return "These three foundations may provide a stronger starting point for support. The path can still be challenging, and this assessment is reflective guidance — not a diagnosis or guarantee.";
  }

  const labels = scores.focusAreas.map((id) => readinessFoundationLabels[id].toLowerCase());
  if (labels.length === 1) {
    return `This area may need support first: ${labels[0]}. Strengthening it before intensive addiction work may provide a clearer foundation.`;
  }

  return `These areas may need support first: ${labels.join(", ")}. When any foundation is low, overall readiness is reduced — even if another area feels stronger.`;
}

export function getNextStepGuidance(scores: ReadinessScores) {
  switch (scores.nextStep) {
    case "urgent_safety":
      return "Next step: follow the urgent safety guidance and contact emergency or medical services if needed.";
    case "motivation_work":
      return "Next step: explore motivation and commitment support before intensive programme work.";
    case "trigger_mapping":
      return "Next step: begin trigger and pattern mapping to build clearer self-awareness.";
    case "emotional_regulation":
      return "Next step: begin emotional regulation support so feelings can be tolerated without escaping.";
    default:
      return "Next step: consider a confidential programme enquiry when you feel ready to talk.";
  }
}

export const readinessPrivacySummary = [
  "Your answers are stored privately in your client profile once you create or sign in to an account.",
  "Gerald/admin can review your completed assessment to support your care conversation.",
  `Completed assessments are retained for up to ${READINESS_RETENTION_YEARS} years, or deleted earlier if you request deletion through the privacy process.`,
  "You can request deletion via the Privacy Policy / Contact process.",
  "This assessment is a reflection and conversation tool — not an admission test, diagnosis, or crisis service.",
] as const;

export type ReadinessDraftPayload = {
  version: number;
  responses: ReadinessResponses;
  savedAt: string;
  draftToken?: string;
};

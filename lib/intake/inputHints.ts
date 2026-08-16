export type IntakeInputKind = "chips_single" | "chips_multi" | "scale" | "short_text";

export type IntakeInputHint = {
  kind: IntakeInputKind;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  helper: string;
  placeholder?: string;
};

const FREQUENCY = ["Daily", "Several times a week", "Weekly", "Weekends mostly", "Occasionally", "Rarely"];
const TIME_OF_DAY = ["Morning", "Afternoon", "Evening", "Night", "Throughout the day", "It varies"];
const DURATION = ["Under 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years", "Not sure"];
const YES_SOMEWHAT_NO = ["Yes", "Somewhat", "No", "Not sure"];
const EMOTIONS = [
  "Stress",
  "Anxiety",
  "Boredom",
  "Loneliness",
  "Anger",
  "Sadness",
  "Shame",
  "Numbness",
  "Other",
];
const SITUATIONS = [
  "Alone",
  "With friends",
  "After work",
  "Weekends",
  "Conflict / arguments",
  "Parties / social events",
  "When tired",
  "Other",
];
const BENEFITS = ["Relaxation", "Sleep", "Focus", "Escape", "Social ease", "Habit / routine", "Other"];
const IDENTITY = ["Still figuring it out", "Someone who wants change", "Someone stuck in a loop", "Other"];

function includesAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}

/** Map free-text case-study questions to lighter tap-first controls. Values still save as plain strings. */
export function resolveIntakeInput(questionText: string): IntakeInputHint {
  const text = questionText.toLowerCase();

  if (includesAny(text, ["how often", "frequency", "currently use"])) {
    return {
      kind: "chips_single",
      options: FREQUENCY,
      helper: "Tap the closest match. Add a short note only if you want to.",
    };
  }

  if (includesAny(text, ["time of day", "typically use"])) {
    return {
      kind: "chips_multi",
      options: TIME_OF_DAY,
      helper: "Tap all that apply.",
    };
  }

  if (includesAny(text, ["when did you first", "first start", "how long"])) {
    return {
      kind: "chips_single",
      options: DURATION,
      helper: "A rough range is enough.",
    };
  }

  if (
    includesAny(text, [
      "do you feel",
      "have you tried",
      "are there",
      "do certain",
      "do you believe you can",
      "do you use",
    ]) &&
    (text.includes("?") || includesAny(text, ["why or why not", "what happened"]))
  ) {
    // Prefer yes/somewhat/no for clear binary-ish stems; leave open if deeply reflective
    if (includesAny(text, ["in control", "cut down", "stop before", "can change", "increase your urge"])) {
      return {
        kind: "chips_single",
        options: YES_SOMEWHAT_NO,
        helper: "Tap first. Optional note if you want to add a detail.",
      };
    }
  }

  if (includesAny(text, ["how automatic", "conscious choice vs habit", "scale"])) {
    return {
      kind: "scale",
      scaleMin: 0,
      scaleMax: 5,
      helper: "0 = fully conscious choice · 5 = completely automatic habit",
    };
  }

  if (includesAny(text, ["feelings", "emotions", "emotionally", "cope with", "trying to change or avoid"])) {
    return {
      kind: "chips_multi",
      options: EMOTIONS,
      helper: "Tap what fits. Skip long essays.",
    };
  }

  if (includesAny(text, ["situations", "people or environments", "triggers", "craving triggers", "reinforce"])) {
    return {
      kind: "chips_multi",
      options: SITUATIONS,
      helper: "Tap the closest patterns.",
    };
  }

  if (includesAny(text, ["what role", "gives you", "relaxation, escape", "impact on your life"])) {
    return {
      kind: "chips_multi",
      options: BENEFITS,
      helper: "Tap what it seems to give you.",
    };
  }

  if (includesAny(text, ["see yourself", "identity would you prefer"])) {
    return {
      kind: "chips_single",
      options: IDENTITY,
      helper: "Tap the closest fit.",
    };
  }

  return {
    kind: "short_text",
    helper: "A sentence or two is enough — you do not need an essay.",
    placeholder: "Short answer…",
  };
}

export function splitIntakeStoredValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { selections: [] as string[], note: "", freeText: "" };

  const noteSplit = trimmed.split(/\s+[—-]\s+Note:\s+/i);
  if (noteSplit.length === 2) {
    return {
      selections: noteSplit[0]
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean),
      note: noteSplit[1].trim(),
      freeText: "",
    };
  }

  if (trimmed.includes(";") && trimmed.length < 180) {
    return {
      selections: trimmed
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean),
      note: "",
      freeText: "",
    };
  }

  return { selections: [] as string[], note: "", freeText: trimmed };
}

export function composeIntakeStoredValue(input: {
  kind: IntakeInputKind;
  selections?: string[];
  note?: string;
  freeText?: string;
  scaleValue?: number | null;
}) {
  if (input.kind === "short_text") {
    return (input.freeText ?? "").trim();
  }

  if (input.kind === "scale") {
    if (input.scaleValue === null || input.scaleValue === undefined) return "";
    const note = (input.note ?? "").trim();
    const base = String(input.scaleValue);
    return note ? `${base} — Note: ${note}` : base;
  }

  const selections = (input.selections ?? []).map((item) => item.trim()).filter(Boolean);
  if (!selections.length) {
    return (input.note ?? "").trim();
  }

  const base = selections.join("; ");
  const note = (input.note ?? "").trim();
  return note ? `${base} — Note: ${note}` : base;
}

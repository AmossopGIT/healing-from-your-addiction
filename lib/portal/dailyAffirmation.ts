import { getCaseStudiesByAddiction } from "@/content/caseStudies";

export type DailyAffirmation = {
  text: string;
  sectionTitle: string;
  addictionSlug: string;
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function getDailyAffirmation(clientProfileId: string, addictionSlug: string | null): DailyAffirmation | null {
  if (!addictionSlug) return null;

  const study = getCaseStudiesByAddiction(addictionSlug).find((item) => item.caseStudyType === "affirmations");
  if (!study) return null;

  const affirmations = study.sections.flatMap((section) =>
    (section.bullets ?? []).map((text) => ({
      text,
      sectionTitle: section.h2,
    })),
  );

  if (!affirmations.length) return null;

  const index = hashString(`${clientProfileId}:${todayIsoDate()}`) % affirmations.length;
  const picked = affirmations[index];

  return {
    text: picked.text,
    sectionTitle: picked.sectionTitle,
    addictionSlug,
  };
}

export function getIntakeInformedAffirmationNote(responses: Record<string, string> | undefined) {
  if (!responses) return null;

  const combined = Object.values(responses).join(" ").toLowerCase();
  if (!combined.trim()) return null;

  if (/(evening|night|late|alone)/.test(combined)) {
    return "You mentioned evenings or alone time in your intake — today's affirmation focuses on calm choice in those moments.";
  }
  if (/(stress|anxiet|overwhelm)/.test(combined)) {
    return "You mentioned stress in your intake — today's affirmation supports steadier responses under pressure.";
  }
  if (/(bored|empty|lonely)/.test(combined)) {
    return "You mentioned boredom or loneliness in your intake — today's affirmation reinforces grounded self-support.";
  }

  return null;
}

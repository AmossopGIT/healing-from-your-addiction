import { programmeBySlug } from "@/content/programmes";

const addictionToProgrammeSlug: Record<string, string> = {
  gambling: "gambling",
  "food-binge-eating": "food-binge-eating",
  alcohol: "alcohol",
  cannabis: "cannabis",
  nicotine: "nicotine",
  pornography: "pornography",
  "social-media": "social-media",
  gaming: "gaming",
};

export function programmeLinkForCaseStudy(addictionSlug: string) {
  const programmeSlug = addictionToProgrammeSlug[addictionSlug];
  if (!programmeSlug) return null;
  return programmeBySlug.get(programmeSlug) ?? null;
}

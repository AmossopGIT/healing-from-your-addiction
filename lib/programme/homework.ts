import type { HomeworkTone } from "@/types/database";

export function homeworkToneForProgrammeWeek(weekNumber: number | null | undefined): HomeworkTone {
  if (!weekNumber || weekNumber <= 2) return "rigid";
  return "playful";
}

export function homeworkFramingCopy(tone: HomeworkTone) {
  if (tone === "rigid") {
    return "Keep it steady and simple. Small consistent practice builds trust in the process.";
  }
  if (tone === "playful") {
    return "You're settling in. Keep the practice light, curious, and confident.";
  }
  return "Complete today's practice at your own pace.";
}

export const DEFAULT_DAILY_HOMEWORK = [
  {
    task_key: "eft_daily",
    title: "EFT tapping",
    description: "Complete today's EFT practice.",
    task_type: "eft_daily" as const,
    points: 5,
    sort_order: 1,
  },
  {
    task_key: "affirmations_daily",
    title: "Affirmations",
    description: "Read and sit with today's affirmation.",
    task_type: "affirmations_daily" as const,
    points: 5,
    sort_order: 2,
  },
];

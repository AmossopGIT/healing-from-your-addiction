import type { ClientIntakeSubmission, Enrollment, SessionProgress } from "@/types/database";

export type PortalMilestone = {
  id: string;
  label: string;
  achieved: boolean;
  achievedAt: string | null;
};

type MilestoneInput = {
  intakeSubmission: ClientIntakeSubmission | null;
  progress: SessionProgress[];
  sessionReceiptReadAts: string[];
  engagementStreak: number;
  enrollment: Enrollment | null;
  maxWeekNumber: number;
};

export function buildPortalMilestones(input: MilestoneInput): PortalMilestone[] {
  const firstOpenedAt = input.sessionReceiptReadAts.sort()[0] ?? null;
  const firstCompleted = input.progress
    .filter((item) => item.status === "completed" && item.completed_at)
    .sort((left, right) => (left.completed_at! < right.completed_at! ? -1 : 1))[0];

  const weekFourReached = input.enrollment
    ? input.maxWeekNumber >= 4 || input.enrollment.current_session_number >= 4
    : false;

  return [
    {
      id: "intake-submitted",
      label: "Intake submitted",
      achieved: Boolean(input.intakeSubmission?.completed_at),
      achievedAt: input.intakeSubmission?.completed_at ?? null,
    },
    {
      id: "first-session-opened",
      label: "First session opened",
      achieved: Boolean(firstOpenedAt),
      achievedAt: firstOpenedAt,
    },
    {
      id: "first-session-completed",
      label: "First session completed",
      achieved: Boolean(firstCompleted),
      achievedAt: firstCompleted?.completed_at ?? null,
    },
    {
      id: "seven-day-rhythm",
      label: "7-day rhythm",
      achieved: input.engagementStreak >= 7,
      achievedAt: input.engagementStreak >= 7 ? new Date().toISOString() : null,
    },
    {
      id: "week-four",
      label: "Week 4 reached",
      achieved: weekFourReached,
      achievedAt: weekFourReached ? input.enrollment?.updated_at ?? null : null,
    },
  ];
}

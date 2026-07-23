import type { PortalNotificationSummary } from "@/lib/dashboard/queries";
import type { ClientConsultation, ClientIntakeSubmission, ProgrammeSession, SessionProgress } from "@/types/database";
import { isConsultationCompleteStatus } from "@/lib/consultation/schema";

export type PortalNextStep = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  artId: string;
  priority: number;
};

type NextStepInput = {
  notifications: PortalNotificationSummary | null;
  intakeSubmission: ClientIntakeSubmission | null;
  intakeIncomplete: boolean;
  consultation: ClientConsultation | null;
  sessions: ProgrammeSession[];
  progressBySessionId: Map<string, SessionProgress>;
  unreadSessionReceipts: Array<{ sessionId: string; sessionNumber: number; title: string }>;
  checkInDoneToday: boolean;
  hasEnrollment: boolean;
};

export function resolvePortalNextStep(input: NextStepInput): PortalNextStep {
  const messageItem = input.notifications?.items.find((item) => item.key === "messages");
  if (messageItem) {
    return {
      title: "Read Gerald's message",
      description: messageItem.description,
      href: messageItem.href,
      buttonLabel: "Open messages",
      artId: "process-enquiry",
      priority: 1,
    };
  }

  const unreadSession = input.unreadSessionReceipts[0];
  if (unreadSession) {
    return {
      title: "New session ready",
      description: `${unreadSession.title} is available in your programme.`,
      href: `/portal/programme/session/${unreadSession.sessionNumber}/`,
      buttonLabel: "Open session",
      artId: "process-support",
      priority: 2,
    };
  }

  if (input.intakeIncomplete) {
    return {
      title: "Complete your intake",
      description: input.intakeSubmission
        ? "Finish your pre-programme questions before your intake conversation."
        : "Answer your intake questions so Gerald can prepare for your conversation.",
      href: "/portal/intake/",
      buttonLabel: input.intakeSubmission ? "Continue intake" : "Start intake",
      artId: "process-understand",
      priority: 3,
    };
  }

  const consultationIncomplete = !input.consultation || !isConsultationCompleteStatus(input.consultation.status);

  if (consultationIncomplete) {
    const percent = input.consultation?.percent_complete ?? 0;
    return {
      title: percent > 0 ? "Continue your consultation form" : "Complete your consultation form",
      description:
        "Fill in your hypnotherapy consultation and informed consent before hypnosis or EFT sessions begin.",
      href: "/portal/consultation/",
      buttonLabel: percent > 0 ? "Continue consultation" : "Start consultation",
      artId: "process-understand",
      priority: 4,
    };
  }

  const inProgressSession = input.sessions.find((session) => {
    const progress = input.progressBySessionId.get(session.id);
    return progress && progress.status !== "locked" && progress.status !== "completed";
  });

  if (inProgressSession) {
    return {
      title: "Continue your session",
      description: `${inProgressSession.title} is in progress.`,
      href: `/portal/programme/session/${inProgressSession.session_number}/`,
      buttonLabel: "Continue session",
      artId: "process-integration",
      priority: 5,
    };
  }

  if (!input.checkInDoneToday) {
    return {
      title: "Today's check-in",
      description: "Take a minute to notice your mood and craving level. Small pauses build rhythm.",
      href: "/portal/#daily-check-in",
      buttonLabel: "Check in now",
      artId: "pattern-map",
      priority: 6,
    };
  }

  if (!input.hasEnrollment) {
    return {
      title: "Programme coming soon",
      description: "Gerald will assign your programme after reviewing your intake and consultation.",
      href: "/portal/messages/",
      buttonLabel: "Message Gerald",
      artId: "process-support",
      priority: 7,
    };
  }

  const nextAvailable = input.sessions.find((session) => {
    const progress = input.progressBySessionId.get(session.id);
    return progress && progress.status !== "locked" && progress.status === "available";
  });

  if (nextAvailable) {
    return {
      title: "Your next session",
      description: `${nextAvailable.title} is ready when you are.`,
      href: `/portal/programme/session/${nextAvailable.session_number}/`,
      buttonLabel: "Open session",
      artId: "process-integration",
      priority: 8,
    };
  }

  return {
    title: "You're up to date",
    description: "Your programme materials and messages are current. Return tomorrow for your daily ritual.",
    href: "/portal/programme/",
    buttonLabel: "View programme",
    artId: "pattern-map",
    priority: 9,
  };
}

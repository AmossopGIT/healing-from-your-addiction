import type { MeetingAction, MeetingActionStatus, MeetingOwner, MeetingRecord } from "@/content/meetings/types";
import { getMeetingById } from "@/content/meetings/catalog";

export type MeetingsTab = "today" | "future" | "archive";

export type ResolvedMeetingAction = MeetingAction & {
  status: MeetingActionStatus;
  meeting: MeetingRecord | null;
};

export function resolveActionStatus(
  action: MeetingAction,
  overrides: Record<string, MeetingActionStatus>,
): MeetingActionStatus {
  return overrides[action.id] ?? action.defaultStatus ?? "open";
}

export function resolveMeetingActions(
  actions: MeetingAction[],
  overrides: Record<string, MeetingActionStatus>,
): ResolvedMeetingAction[] {
  return actions.map((action) => ({
    ...action,
    status: resolveActionStatus(action, overrides),
    meeting: getMeetingById(action.meetingId),
  }));
}

export function filterActionsForTab(
  actions: ResolvedMeetingAction[],
  tab: MeetingsTab,
  owner: MeetingOwner | "all",
): ResolvedMeetingAction[] {
  const byOwner = owner === "all" ? actions : actions.filter((action) => action.owner === owner);

  if (tab === "archive") {
    return byOwner.filter((action) => action.status === "done");
  }

  return byOwner.filter((action) => action.status !== "done" && action.bucket === tab);
}

export const meetingOwnerLabels: Record<MeetingOwner | "all", string> = {
  all: "Everyone",
  gerald: "Gerald",
  andy: "Andy",
  joint: "Joint",
};

export const meetingStatusLabels: Record<MeetingActionStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
};

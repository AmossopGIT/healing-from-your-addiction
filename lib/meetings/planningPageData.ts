import { meetingActions, meetingRecords } from "@/content/meetings/catalog";
import type { MeetingOwner } from "@/content/meetings/types";
import { readMeetingActionStatusOverrides } from "@/lib/meetings/statusStore";
import {
  filterActionsForTab,
  resolveMeetingActions,
  type MeetingsTab,
} from "@/lib/meetings/workspace";

export function parsePlanningTab(value: string | undefined): MeetingsTab {
  if (value === "future" || value === "archive" || value === "today") return value;
  return "today";
}

export function parsePlanningOwner(value: string | undefined): MeetingOwner | "all" {
  if (value === "gerald" || value === "andy" || value === "joint" || value === "all") return value;
  return "gerald";
}

export async function getPlanningWorkspaceData(params: { tab?: string; owner?: string }) {
  const tab = parsePlanningTab(params.tab);
  const owner = parsePlanningOwner(params.owner);
  const overrides = await readMeetingActionStatusOverrides();
  const resolved = resolveMeetingActions(meetingActions, overrides);

  return {
    tab,
    owner,
    actions: filterActionsForTab(resolved, tab, owner),
    meetings: meetingRecords,
    counts: {
      today: filterActionsForTab(resolved, "today", owner).length,
      future: filterActionsForTab(resolved, "future", owner).length,
      archive: filterActionsForTab(resolved, "archive", owner).length,
    },
  };
}

export async function getGeraldDoNowCount() {
  const overrides = await readMeetingActionStatusOverrides();
  const resolved = resolveMeetingActions(meetingActions, overrides);
  return filterActionsForTab(resolved, "today", "gerald").length;
}

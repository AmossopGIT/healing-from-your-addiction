import { cookies } from "next/headers";
import type { MeetingActionStatus } from "@/content/meetings/types";

const COOKIE_NAME = "hfya_meeting_action_status";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const allowedStatuses = new Set<MeetingActionStatus>(["open", "in_progress", "done"]);

export async function readMeetingActionStatusOverrides(): Promise<Record<string, MeetingActionStatus>> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const result: Record<string, MeetingActionStatus> = {};
    for (const [id, status] of Object.entries(parsed)) {
      if (typeof id === "string" && typeof status === "string" && allowedStatuses.has(status as MeetingActionStatus)) {
        result[id] = status as MeetingActionStatus;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function writeMeetingActionStatusOverrides(overrides: Record<string, MeetingActionStatus>) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(overrides)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

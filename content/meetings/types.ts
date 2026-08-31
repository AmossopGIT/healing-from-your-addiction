export type MeetingOwner = "gerald" | "andy" | "joint";

export type MeetingActionStatus = "open" | "in_progress" | "done";

/** Where an open action should appear in the workspace. */
export type MeetingActionBucket = "today" | "future";

export type MeetingRecord = {
  id: string;
  date: string;
  title: string;
  summary: string;
  docHref?: string;
  /** ISO date YYYY-MM-DD — used for archive cut-off */
  dateIso: string;
};

export type MeetingAction = {
  id: string;
  meetingId: string;
  owner: MeetingOwner;
  title: string;
  dueLabel: string;
  /** Default bucket when status is still open / in progress */
  bucket: MeetingActionBucket;
  href?: string;
  hrefLabel?: string;
  defaultStatus?: MeetingActionStatus;
};

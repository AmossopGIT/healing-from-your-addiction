import type { Metadata } from "next";
import { meetingActions, meetingRecords } from "@/content/meetings/catalog";
import type { MeetingOwner } from "@/content/meetings/types";
import { MeetingsWorkspace } from "@/components/dashboard/meetings/MeetingsWorkspace";
import { readMeetingActionStatusOverrides } from "@/lib/meetings/statusStore";
import {
  filterActionsForTab,
  resolveMeetingActions,
  type MeetingsTab,
} from "@/lib/meetings/workspace";
import { createMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ tab?: string; owner?: string }>;
};

export const metadata: Metadata = createMetadata({
  title: "Meetings | Admin",
  description: "Today, future, and archive action items from internal planning meetings.",
  path: "/admin/meetings/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

function parseTab(value: string | undefined): MeetingsTab {
  if (value === "future" || value === "archive" || value === "today") return value;
  return "today";
}

function parseOwner(value: string | undefined): MeetingOwner | "all" {
  if (value === "gerald" || value === "andy" || value === "joint" || value === "all") return value;
  return "gerald";
}

export default async function AdminMeetingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = parseTab(params.tab);
  const owner = parseOwner(params.owner);
  const overrides = await readMeetingActionStatusOverrides();
  const resolved = resolveMeetingActions(meetingActions, overrides);

  const actions = filterActionsForTab(resolved, tab, owner);
  const counts = {
    today: filterActionsForTab(resolved, "today", owner).length,
    future: filterActionsForTab(resolved, "future", owner).length,
    archive: filterActionsForTab(resolved, "archive", owner).length,
  };

  return (
    <MeetingsWorkspace
      tab={tab}
      owner={owner}
      actions={actions}
      meetings={meetingRecords}
      counts={counts}
    />
  );
}

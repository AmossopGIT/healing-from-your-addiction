import Link from "next/link";
import type { MeetingOwner } from "@/content/meetings/types";
import { MeetingActionRow } from "@/components/dashboard/meetings/MeetingActionRow";
import type { MeetingsTab, ResolvedMeetingAction } from "@/lib/meetings/workspace";
import { meetingOwnerLabels } from "@/lib/meetings/workspace";
import type { MeetingRecord } from "@/content/meetings/types";

type MeetingsWorkspaceProps = {
  tab: MeetingsTab;
  owner: MeetingOwner | "all";
  actions: ResolvedMeetingAction[];
  meetings: MeetingRecord[];
  counts: { today: number; future: number; archive: number };
};

const tabs: Array<{ id: MeetingsTab; label: string; hint: string }> = [
  { id: "today", label: "Today", hint: "Do now or this week" },
  { id: "future", label: "Future", hint: "Waiting or later" },
  { id: "archive", label: "Archive", hint: "Done + past notes" },
];

const owners: Array<MeetingOwner | "all"> = ["gerald", "andy", "joint", "all"];

export function MeetingsWorkspace({ tab, owner, actions, meetings, counts }: MeetingsWorkspaceProps) {
  return (
    <div className="dashboard-stack meetings-workspace">
      <section className="dashboard-page-header">
        <p className="eyebrow">Team workspace</p>
        <h1>Meetings</h1>
        <p>
          What to do next after planning calls. Mark items done as you go — full write-ups stay in{" "}
          <Link href="/admin/docs/meeting-notes-index/">meeting notes</Link>.
        </p>
      </section>

      <section className="dashboard-panel meetings-toolbar-panel">
        <div className="meetings-tabs" role="tablist" aria-label="Meeting views">
          {tabs.map((item) => {
            const href = `/admin/meetings/?tab=${item.id}&owner=${owner}`;
            const count = counts[item.id];
            const active = tab === item.id;
            return (
              <Link
                key={item.id}
                href={href}
                className={`meetings-tab${active ? " is-active" : ""}`}
                role="tab"
                aria-selected={active}
              >
                <span className="meetings-tab-label">{item.label}</span>
                <span className="meetings-tab-count">{count}</span>
                <span className="meetings-tab-hint">{item.hint}</span>
              </Link>
            );
          })}
        </div>

        <div className="meetings-owner-filters" aria-label="Filter by owner">
          {owners.map((value) => {
            const href = `/admin/meetings/?tab=${tab}&owner=${value}`;
            const active = owner === value;
            return (
              <Link key={value} href={href} className={`meetings-owner-filter${active ? " is-active" : ""}`}>
                {meetingOwnerLabels[value]}
              </Link>
            );
          })}
        </div>
      </section>

      {tab === "archive" ? (
        <section className="dashboard-panel">
          <h2>Past meetings</h2>
          <p className="dashboard-inline-note">Full notes and PDFs for the record.</p>
          <ul className="meetings-archive-list">
            {meetings.map((meeting) => (
              <li key={meeting.id} className="meetings-archive-item">
                <div>
                  <p className="meetings-archive-date">{meeting.date}</p>
                  <h3 className="meetings-archive-title">{meeting.title}</h3>
                  <p className="meetings-archive-summary">{meeting.summary}</p>
                </div>
                {meeting.docHref ? (
                  <Link className="button button-secondary" href={meeting.docHref}>
                    Open notes
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="dashboard-panel">
        <h2>
          {tab === "today" ? "Action items for now" : null}
          {tab === "future" ? "Parked and waiting" : null}
          {tab === "archive" ? "Completed actions" : null}
        </h2>
        {actions.length === 0 ? (
          <p className="dashboard-empty">
            {tab === "today"
              ? "Nothing due right now for this filter. Check Future, or switch owner."
              : tab === "future"
                ? "No future items for this filter."
                : "No completed actions yet. Mark items Done from Today or Future."}
          </p>
        ) : (
          <div className="meeting-action-list">
            {actions.map((action) => (
              <MeetingActionRow key={action.id} action={action} tab={tab} ownerFilter={owner} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

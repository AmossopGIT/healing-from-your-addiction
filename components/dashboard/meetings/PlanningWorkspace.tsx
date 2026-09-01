import Link from "next/link";
import type { MeetingOwner } from "@/content/meetings/types";
import { PlanningActionRow } from "@/components/dashboard/meetings/PlanningActionRow";
import type { MeetingsTab, ResolvedMeetingAction } from "@/lib/meetings/workspace";
import { meetingOwnerLabels } from "@/lib/meetings/workspace";
import type { MeetingRecord } from "@/content/meetings/types";

type PlanningWorkspaceProps = {
  tab: MeetingsTab;
  owner: MeetingOwner | "all";
  actions: ResolvedMeetingAction[];
  meetings: MeetingRecord[];
  counts: { today: number; future: number; archive: number };
};

const timeBuckets: Array<{ id: MeetingsTab; label: string; hint: string }> = [
  { id: "today", label: "Do now", hint: "This week / immediate" },
  { id: "future", label: "Later", hint: "Waiting / TBD" },
  { id: "archive", label: "Done & history", hint: "Completed + past notes" },
];

const owners: Array<MeetingOwner | "all"> = ["gerald", "andy", "joint", "all"];

function panelTitle(tab: MeetingsTab) {
  if (tab === "today") return "Action items for now";
  if (tab === "future") return "Parked and waiting";
  return "Completed actions";
}

function emptyMessage(tab: MeetingsTab) {
  if (tab === "today") {
    return "Nothing due right now for this filter. Check Later, or switch owner.";
  }
  if (tab === "future") {
    return "No later items for this filter.";
  }
  return "No completed actions yet. Mark items done from Do now or Later.";
}

export function PlanningWorkspace({ tab, owner, actions, meetings, counts }: PlanningWorkspaceProps) {
  const planningBase = "/admin/planning/";

  return (
    <div className="dashboard-stack planning-workspace">
      <section className="dashboard-page-header">
        <p className="eyebrow">Internal · Team & internal</p>
        <h1>Team planning</h1>
        <p>What to do next after internal planning calls with Andy — not client therapy or group sessions.</p>
      </section>

      <section className="planning-disclaimer dashboard-panel" role="note">
        <p>
          This is for <strong>internal business planning</strong>. Client sessions and programme live slots are managed
          under <Link href="/admin/clients/">Clients</Link> → Programme.
        </p>
      </section>

      <div className="planning-layout">
        <aside className="planning-rail dashboard-panel" aria-label="Planning views">
          <div className="planning-rail-group">
            <p className="planning-rail-heading">When</p>
            <nav className="planning-rail-nav" role="tablist" aria-label="Time buckets">
              {timeBuckets.map((item) => {
                const href = `${planningBase}?tab=${item.id}&owner=${owner}`;
                const active = tab === item.id;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`planning-rail-link${active ? " is-active" : ""}`}
                    role="tab"
                    aria-selected={active}
                  >
                    <span className="planning-rail-link-label">{item.label}</span>
                    <span className="planning-rail-link-count">{counts[item.id]}</span>
                    <span className="planning-rail-link-hint">{item.hint}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="planning-rail-group">
            <p className="planning-rail-heading">Who</p>
            <nav className="planning-rail-owners" aria-label="Filter by owner">
              {owners.map((value) => {
                const href = `${planningBase}?tab=${tab}&owner=${value}`;
                const active = owner === value;
                return (
                  <Link
                    key={value}
                    href={href}
                    className={`planning-rail-owner${active ? " is-active" : ""}`}
                  >
                    {meetingOwnerLabels[value]}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="planning-rail-footer">
            <Link href="/admin/docs/meeting-notes-index/" className="planning-rail-records-link">
              Planning records →
            </Link>
          </div>
        </aside>

        <div className="planning-main">
          {tab === "archive" ? (
            <section className="dashboard-panel">
              <h2>Past planning records</h2>
              <p className="dashboard-inline-note">Full write-ups and PDFs for the record.</p>
              <ul className="planning-archive-list">
                {meetings.map((meeting) => (
                  <li key={meeting.id} className="planning-archive-item">
                    <div>
                      <p className="planning-archive-date">{meeting.date}</p>
                      <h3 className="planning-archive-title">{meeting.title}</h3>
                      <p className="planning-archive-summary">{meeting.summary}</p>
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
            <h2>{panelTitle(tab)}</h2>
            {actions.length === 0 ? (
              <p className="dashboard-empty">{emptyMessage(tab)}</p>
            ) : (
              <div className="planning-action-list">
                {actions.map((action) => (
                  <PlanningActionRow
                    key={action.id}
                    action={action}
                    tab={tab}
                    ownerFilter={owner}
                    readOnly={tab === "archive"}
                  />
                ))}
              </div>
            )}
          </section>

          <p className="dashboard-inline-note planning-status-note">
            Status is saved on this device until team-wide sync is added.
          </p>
        </div>
      </div>
    </div>
  );
}

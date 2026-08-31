import Link from "next/link";
import type { MeetingActionStatus } from "@/content/meetings/types";
import { updateMeetingActionStatusForm } from "@/lib/meetings/actions";
import type { ResolvedMeetingAction } from "@/lib/meetings/workspace";
import { meetingOwnerLabels, meetingStatusLabels } from "@/lib/meetings/workspace";

type MeetingActionRowProps = {
  action: ResolvedMeetingAction;
  tab: string;
  ownerFilter: string;
};

const statusOptions: MeetingActionStatus[] = ["open", "in_progress", "done"];

export function MeetingActionRow({ action, tab, ownerFilter }: MeetingActionRowProps) {
  return (
    <article className={`meeting-action-row meeting-action-status-${action.status}`}>
      <div className="meeting-action-row-main">
        <div className="meeting-action-row-meta">
          <span className={`meeting-status-chip meeting-status-chip-${action.status}`}>
            {meetingStatusLabels[action.status]}
          </span>
          <span className="meeting-owner-chip">{meetingOwnerLabels[action.owner]}</span>
          <span className="meeting-due-chip">{action.dueLabel}</span>
        </div>
        <p className="meeting-action-title">{action.title}</p>
        {action.meeting ? (
          <p className="meeting-action-source">
            From:{" "}
            {action.meeting.docHref ? (
              <Link href={action.meeting.docHref}>{action.meeting.title}</Link>
            ) : (
              action.meeting.title
            )}{" "}
            · {action.meeting.date}
          </p>
        ) : null}
      </div>

      <div className="meeting-action-row-actions">
        {action.href ? (
          <Link className="button button-secondary meeting-action-cta" href={action.href}>
            {action.hrefLabel ?? "Open"}
          </Link>
        ) : null}
        <div className="meeting-status-button-row" role="group" aria-label={`Update status for ${action.title}`}>
          {statusOptions.map((status) => (
            <form key={status} action={updateMeetingActionStatusForm}>
              <input type="hidden" name="actionId" value={action.id} />
              <input type="hidden" name="tab" value={tab} />
              <input type="hidden" name="owner" value={ownerFilter} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                className={`meeting-status-button${action.status === status ? " is-active" : ""}`}
                disabled={action.status === status}
                aria-current={action.status === status ? "true" : undefined}
              >
                {meetingStatusLabels[status]}
              </button>
            </form>
          ))}
        </div>
      </div>
    </article>
  );
}

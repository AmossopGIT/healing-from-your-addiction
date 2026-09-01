import Link from "next/link";
import type { MeetingActionStatus } from "@/content/meetings/types";
import { updateMeetingActionStatusForm } from "@/lib/meetings/actions";
import type { ResolvedMeetingAction } from "@/lib/meetings/workspace";
import { meetingOwnerLabels, meetingStatusLabels } from "@/lib/meetings/workspace";

type PlanningActionRowProps = {
  action: ResolvedMeetingAction;
  tab: string;
  ownerFilter: string;
  readOnly?: boolean;
};

export function PlanningActionRow({ action, tab, ownerFilter, readOnly = false }: PlanningActionRowProps) {
  const showMarkDone = !readOnly && action.status !== "done";
  const showStatusSelect = !readOnly && action.status !== "done";

  return (
    <article className={`planning-action-row planning-action-status-${action.status}${readOnly ? " is-readonly" : ""}`}>
      <div className="planning-action-row-main">
        <div className="planning-action-row-meta">
          <span className={`planning-status-chip planning-status-chip-${action.status}`}>
            {meetingStatusLabels[action.status]}
          </span>
          <span className="planning-owner-chip">{meetingOwnerLabels[action.owner]}</span>
          <span className="planning-due-chip">{action.dueLabel}</span>
        </div>
        <p className="planning-action-title">{action.title}</p>
        {action.meeting ? (
          <p className="planning-action-source">
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

      <div className="planning-action-row-actions">
        {action.href ? (
          <Link className="button button-secondary planning-action-cta" href={action.href}>
            {action.hrefLabel ?? "Open"}
          </Link>
        ) : null}

        {!readOnly ? (
          <div className="planning-action-controls">
            {showMarkDone ? (
              <form action={updateMeetingActionStatusForm}>
                <input type="hidden" name="actionId" value={action.id} />
                <input type="hidden" name="tab" value={tab} />
                <input type="hidden" name="owner" value={ownerFilter} />
                <input type="hidden" name="status" value="done" />
                <button type="submit" className="button button-primary planning-mark-done">
                  Mark done
                </button>
              </form>
            ) : null}

            {showStatusSelect ? (
              <form action={updateMeetingActionStatusForm} className="planning-status-form">
                <input type="hidden" name="actionId" value={action.id} />
                <input type="hidden" name="tab" value={tab} />
                <input type="hidden" name="owner" value={ownerFilter} />
                <label className="planning-status-label" htmlFor={`status-${action.id}`}>
                  Status
                </label>
                <select
                  id={`status-${action.id}`}
                  name="status"
                  defaultValue={action.status}
                  className="planning-status-select"
                >
                  {(["open", "in_progress"] as MeetingActionStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {meetingStatusLabels[status]}
                    </option>
                  ))}
                </select>
                <button type="submit" className="button button-secondary planning-status-save">
                  Save
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

import { cmsWorkflowStatusLabels, cmsWorkflowTransitions, type CmsWorkflowStatus } from "@/types/cms";
import { transitionBlogWorkflow, transitionCaseStudyWorkflow } from "@/lib/cms/actions";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import type { CmsWorkflowEventRow } from "@/types/cms";

type CmsWorkflowPanelProps = {
  contentType: "blog" | "case-study";
  contentId: string;
  status: CmsWorkflowStatus;
  scheduledFor: string | null;
  events: CmsWorkflowEventRow[];
};

export function CmsWorkflowPanel({ contentType, contentId, status, scheduledFor, events }: CmsWorkflowPanelProps) {
  const action = contentType === "blog" ? transitionBlogWorkflow : transitionCaseStudyWorkflow;
  const nextStatuses = cmsWorkflowTransitions[status];

  return (
    <section className="dashboard-panel cms-workflow-panel">
      <h2>Editorial workflow</h2>
      <p>
        Status: <span className={`cms-status-badge cms-status-${status}`}>{cmsWorkflowStatusLabels[status]}</span>
      </p>
      {scheduledFor ? <p>Scheduled for: {formatDashboardDate(scheduledFor)}</p> : null}

      <div className="cms-workflow-actions">
        {nextStatuses.includes("in_review") ? (
          <form action={action}>
            <input type="hidden" name="id" value={contentId} />
            <input type="hidden" name="toStatus" value="in_review" />
            <button type="submit" className="button button-secondary">
              Submit for review
            </button>
          </form>
        ) : null}

        {nextStatuses.includes("approved") ? (
          <form action={action} className="cms-workflow-form">
            <input type="hidden" name="id" value={contentId} />
            <input type="hidden" name="toStatus" value="approved" />
            <label className="form-field">
              <span>Review notes (optional)</span>
              <input name="notes" placeholder="Approved for publish" />
            </label>
            <button type="submit" className="button button-primary">
              Approve
            </button>
          </form>
        ) : null}

        {nextStatuses.includes("draft") && status !== "draft" ? (
          <form action={action} className="cms-workflow-form">
            <input type="hidden" name="id" value={contentId} />
            <input type="hidden" name="toStatus" value="draft" />
            <label className="form-field">
              <span>Revision notes</span>
              <input name="notes" placeholder="Reason for sending back to draft" required />
            </label>
            <button type="submit" className="button button-secondary">
              Send back to draft
            </button>
          </form>
        ) : null}

        {nextStatuses.includes("scheduled") ? (
          <form action={action} className="cms-workflow-form">
            <input type="hidden" name="id" value={contentId} />
            <input type="hidden" name="toStatus" value="scheduled" />
            <label className="form-field">
              <span>Schedule publish</span>
              <input name="scheduledFor" type="datetime-local" required />
            </label>
            <button type="submit" className="button button-secondary">
              Schedule publish
            </button>
          </form>
        ) : null}

        {nextStatuses.includes("published") ? (
          <form action={action}>
            <input type="hidden" name="id" value={contentId} />
            <input type="hidden" name="toStatus" value="published" />
            <button type="submit" className="button button-primary">
              Publish now
            </button>
          </form>
        ) : null}

        {nextStatuses.includes("archived") ? (
          <form action={action}>
            <input type="hidden" name="id" value={contentId} />
            <input type="hidden" name="toStatus" value="archived" />
            <button type="submit" className="button button-secondary">
              Unpublish / archive
            </button>
          </form>
        ) : null}
      </div>

      {events.length ? (
        <div className="cms-workflow-history">
          <h3>Workflow history</h3>
          <ul className="dashboard-note-list">
            {events.map((event) => (
              <li key={event.id}>
                <strong>
                  {event.from_status ? `${event.from_status} → ${event.to_status}` : event.to_status}
                </strong>
                <p>{formatDashboardDate(event.created_at)}</p>
                {event.notes ? <p>{event.notes}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

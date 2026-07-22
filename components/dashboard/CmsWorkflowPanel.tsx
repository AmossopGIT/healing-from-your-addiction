"use client";

import { useActionState } from "react";
import { CmsFormSubmitButton } from "@/components/dashboard/CmsFormSubmitButton";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";
import { transitionBlogWorkflow, transitionCaseStudyWorkflow, type CmsFormActionState } from "@/lib/cms/actions";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { cmsWorkflowStatusLabels, cmsWorkflowTransitions, type CmsWorkflowStatus } from "@/types/cms";
import type { CmsWorkflowEventRow } from "@/types/cms";

type CmsWorkflowPanelProps = {
  contentType: "blog" | "case-study";
  contentId: string;
  status: CmsWorkflowStatus;
  scheduledFor: string | null;
  events: CmsWorkflowEventRow[];
  /** Precomputed publish blockers so staff see why Publish will fail before clicking. */
  publishBlockers?: string[];
};

const STATUS_STEPS: CmsWorkflowStatus[] = ["draft", "in_review", "approved", "published"];

function nextStepCopy(status: CmsWorkflowStatus, scheduledFor: string | null): string {
  switch (status) {
    case "draft":
      return "Save your content, then Publish now (make live), Schedule for later, or Submit for review.";
    case "in_review":
      return "Approve for publishing, Publish now, Schedule for later, or send back to draft.";
    case "approved":
      return "Ready to go live — Publish now, or Schedule for later.";
    case "scheduled":
      return scheduledFor
        ? `Goes live: ${formatDashboardDate(scheduledFor)}. You can Publish now, change the schedule, or cancel.`
        : "Scheduled — set a go-live date, Publish now, or cancel.";
    case "published":
      return "This is live on the site. Unpublish/archive if you need to take it down.";
    case "archived":
      return "Archived — send back to draft to edit and republish.";
    default:
      return "";
  }
}

function stepIsActive(step: CmsWorkflowStatus, status: CmsWorkflowStatus): boolean {
  if (status === "scheduled" && step === "published") return true;
  if (status === "archived" && step === "published") return false;
  return step === status || (status === "scheduled" && step === "approved");
}

function stepIsDone(step: CmsWorkflowStatus, status: CmsWorkflowStatus): boolean {
  const order: CmsWorkflowStatus[] = ["draft", "in_review", "approved", "published"];
  const current = status === "scheduled" ? "approved" : status === "archived" ? "published" : status;
  return order.indexOf(step) < order.indexOf(current);
}

/** Convert ISO datetime to value for datetime-local input (local wall time). */
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function WorkflowActionForm({
  action,
  contentId,
  toStatus,
  children,
  className,
}: {
  action: (prev: CmsFormActionState, formData: FormData) => Promise<CmsFormActionState>;
  contentId: string;
  toStatus: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="id" value={contentId} />
      <input type="hidden" name="toStatus" value={toStatus} />
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {children}
    </form>
  );
}

export function CmsWorkflowPanel({
  contentType,
  contentId,
  status,
  scheduledFor,
  events,
  publishBlockers = [],
}: CmsWorkflowPanelProps) {
  const action = contentType === "blog" ? transitionBlogWorkflow : transitionCaseStudyWorkflow;
  const nextStatuses = cmsWorkflowTransitions[status] ?? [];
  const canPublish = nextStatuses.includes("published");
  const canSchedule = nextStatuses.includes("scheduled");
  const canReview = nextStatuses.includes("in_review");
  const canApprove = nextStatuses.includes("approved") && status !== "scheduled";
  const canCancelSchedule = status === "scheduled" && nextStatuses.includes("approved");
  const canSendToDraft = nextStatuses.includes("draft") && status !== "draft";
  const canArchive = nextStatuses.includes("archived");
  const scheduleLabel = status === "scheduled" ? "Change schedule" : "Schedule for later";
  const hasPublishBlockers = publishBlockers.length > 0;
  const showMakeLive = (canPublish || canSchedule) && status !== "published" && status !== "archived";

  return (
    <section className="dashboard-panel cms-workflow-panel">
      <h2>Publishing</h2>

      <ol className="cms-workflow-steps" aria-label="Publishing path">
        {STATUS_STEPS.map((step) => {
          const label = step === "published" ? "Live" : cmsWorkflowStatusLabels[step];
          const done = stepIsDone(step, status);
          const active = stepIsActive(step, status) && !done;
          return (
            <li
              key={step}
              className={`cms-workflow-step${done ? " is-done" : ""}${active ? " is-active" : ""}`}
            >
              {label}
            </li>
          );
        })}
      </ol>

      <p className="cms-workflow-status-line">
        Status:{" "}
        <span className={`cms-status-badge cms-status-${status}`}>
          {status === "scheduled" ? "Scheduled (goes live at set time)" : cmsWorkflowStatusLabels[status]}
        </span>
      </p>
      <p className="cms-field-help">{nextStepCopy(status, scheduledFor)}</p>

      {showMakeLive && hasPublishBlockers ? (
        <div className="cms-publish-blockers" role="status">
          <p className="form-error">Fix these before Publish / Schedule will succeed:</p>
          <ul>
            {publishBlockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
          <p className="cms-field-help">Edit the form below, Save changes, then return here to publish.</p>
        </div>
      ) : null}

      {showMakeLive ? (
        <div className="cms-workflow-group">
          <h3 className="cms-workflow-group-title">Make live</h3>
          {status === "scheduled" && scheduledFor ? (
            <p className="cms-inline-status">
              Goes live: <strong>{formatDashboardDate(scheduledFor)}</strong>
            </p>
          ) : null}
          <div className="cms-workflow-actions">
            {canPublish ? (
              <WorkflowActionForm action={action} contentId={contentId} toStatus="published">
                <CmsFormSubmitButton
                  idleLabel="Publish now (make live)"
                  pendingLabel="Publishing…"
                  disabled={hasPublishBlockers}
                />
              </WorkflowActionForm>
            ) : null}
          </div>
          {canSchedule ? (
            <WorkflowActionForm action={action} contentId={contentId} toStatus="scheduled" className="cms-workflow-form">
              <label className="form-field">
                <span>{scheduleLabel}</span>
                <input
                  name="scheduledFor"
                  type="datetime-local"
                  required
                  defaultValue={toDatetimeLocalValue(scheduledFor)}
                  disabled={hasPublishBlockers}
                />
              </label>
              <p className="cms-field-help">
                Uses your local browser time. The site shows the article when that time is reached.
              </p>
              <CmsFormSubmitButton
                idleLabel={scheduleLabel}
                pendingLabel="Scheduling…"
                className="button button-secondary"
                disabled={hasPublishBlockers}
              />
            </WorkflowActionForm>
          ) : null}
          {canCancelSchedule ? (
            <WorkflowActionForm action={action} contentId={contentId} toStatus="approved" className="cms-workflow-form">
              <input type="hidden" name="notes" value="Cancelled schedule" />
              <CmsFormSubmitButton
                idleLabel="Cancel schedule"
                pendingLabel="Cancelling…"
                className="button button-secondary"
              />
            </WorkflowActionForm>
          ) : null}
        </div>
      ) : null}

      {(canReview || canApprove || canSendToDraft) && status !== "published" && status !== "archived" ? (
        <div className="cms-workflow-group">
          <h3 className="cms-workflow-group-title">Review (optional)</h3>
          <p className="cms-field-help">
            Use this if someone else should approve before go-live. You can still publish directly above.
          </p>
          <div className="cms-workflow-actions">
            {canReview ? (
              <WorkflowActionForm action={action} contentId={contentId} toStatus="in_review">
                <CmsFormSubmitButton
                  idleLabel="Submit for review"
                  pendingLabel="Submitting…"
                  className="button button-secondary"
                />
              </WorkflowActionForm>
            ) : null}
          </div>
          {canApprove ? (
            <WorkflowActionForm action={action} contentId={contentId} toStatus="approved" className="cms-workflow-form">
              <label className="form-field">
                <span>Review notes (optional)</span>
                <input name="notes" maxLength={cmsFieldMaxLengths.workflowNotes} placeholder="Approved for publish" />
              </label>
              <CmsFormSubmitButton idleLabel="Approve" pendingLabel="Approving…" className="button button-secondary" />
            </WorkflowActionForm>
          ) : null}
          {canSendToDraft ? (
            <WorkflowActionForm action={action} contentId={contentId} toStatus="draft" className="cms-workflow-form">
              <label className="form-field">
                <span>Revision notes</span>
                <input
                  name="notes"
                  maxLength={cmsFieldMaxLengths.workflowNotes}
                  placeholder="Reason for sending back to draft"
                  required
                />
              </label>
              <CmsFormSubmitButton
                idleLabel="Send back to draft"
                pendingLabel="Sending…"
                className="button button-secondary"
              />
            </WorkflowActionForm>
          ) : null}
        </div>
      ) : null}

      {(canArchive || (canSendToDraft && (status === "published" || status === "archived"))) && (
        <div className="cms-workflow-group">
          <h3 className="cms-workflow-group-title">After live</h3>
          <div className="cms-workflow-actions">
            {canArchive ? (
              <WorkflowActionForm action={action} contentId={contentId} toStatus="archived">
                <CmsFormSubmitButton
                  idleLabel="Unpublish / archive"
                  pendingLabel="Archiving…"
                  className="button button-secondary"
                />
              </WorkflowActionForm>
            ) : null}
            {canSendToDraft && (status === "published" || status === "archived") ? (
              <WorkflowActionForm action={action} contentId={contentId} toStatus="draft" className="cms-workflow-form">
                <label className="form-field">
                  <span>Revision notes</span>
                  <input
                    name="notes"
                    maxLength={cmsFieldMaxLengths.workflowNotes}
                    placeholder="Reason for sending back to draft"
                    required
                  />
                </label>
                <CmsFormSubmitButton
                  idleLabel="Send back to draft"
                  pendingLabel="Sending…"
                  className="button button-secondary"
                />
              </WorkflowActionForm>
            ) : null}
          </div>
        </div>
      )}

      {events.length ? (
        <details className="cms-workflow-history">
          <summary>Workflow history</summary>
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
        </details>
      ) : null}
    </section>
  );
}

import Link from "next/link";
import {
  CONSULTATION_STEPS,
  consultationHasSafetyFlags,
  consultationHasUrgentSafetyFlag,
  consultationStatusLabels,
  isConsultationCompleteStatus,
} from "@/lib/consultation/schema";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { savePractitionerConsultationNotes, sendConsultationInvite } from "@/lib/dashboard/consultationActions";
import type { ClientConsultation } from "@/types/database";

type AdminConsultationViewProps = {
  consultation: ClientConsultation | null;
  clientProfileId: string;
  clientName: string;
  sent?: boolean;
  notesSaved?: boolean;
  error?: string;
};

function formatAnswer(value: unknown) {
  if (value == null) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  const text = String(value).trim();
  return text || "—";
}

export function AdminConsultationView({
  consultation,
  clientProfileId,
  clientName,
  sent,
  notesSaved,
  error,
}: AdminConsultationViewProps) {
  const responses = consultation?.responses ?? {};
  const hasSafety = consultationHasSafetyFlags(responses);
  const hasUrgent = consultationHasUrgentSafetyFlag(responses);

  return (
    <div className="dashboard-stack">
      {sent ? <p className="dashboard-inline-note dashboard-success-note">Consultation form email sent.</p> : null}
      {notesSaved ? <p className="dashboard-inline-note dashboard-success-note">Practitioner notes saved.</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {hasSafety ? (
        <p className={`consultation-safety-banner ${hasUrgent ? "consultation-safety-banner-urgent" : ""}`} role="status">
          {hasUrgent
            ? "Urgent safety flag: client indicated current suicidal thoughts. Review sensitively and follow your clinical process."
            : "Safety screening notes are present. Review the trauma & safety section carefully."}
        </p>
      ) : null}

      <section className="dashboard-panel">
        <h2>Status & delivery</h2>
        {consultation ? (
          <>
            <dl className="dashboard-dl">
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`status-badge status-badge-consultation-${consultation.status}`}>
                    {consultationStatusLabels[consultation.status]}
                  </span>
                  {consultation.percent_complete != null ? ` · ${consultation.percent_complete}%` : null}
                </dd>
              </div>
              <div>
                <dt>Sent</dt>
                <dd>{consultation.sent_at ? formatDashboardDate(consultation.sent_at) : "—"}</dd>
              </div>
              <div>
                <dt>Delivered</dt>
                <dd>{consultation.delivered_at ? formatDashboardDate(consultation.delivered_at) : "—"}</dd>
              </div>
              <div>
                <dt>Opened</dt>
                <dd>{consultation.opened_at ? formatDashboardDate(consultation.opened_at) : "—"}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{consultation.started_at ? formatDashboardDate(consultation.started_at) : "—"}</dd>
              </div>
              <div>
                <dt>Completed</dt>
                <dd>
                  {consultation.completed_at ? formatDashboardDate(consultation.completed_at) : "—"}
                  {consultation.completion_mode ? ` (${consultation.completion_mode})` : ""}
                </dd>
              </div>
            </dl>
            <ul className="consultation-timeline">
              {(
                [
                  ["Sent", consultation.sent_at],
                  ["Delivered", consultation.delivered_at],
                  ["Opened", consultation.opened_at],
                  ["Started", consultation.started_at],
                  ["Completed", consultation.completed_at],
                ] as const
              ).map(([label, value]) => (
                <li key={label} className={value ? "is-done" : ""}>
                  <span>{label}</span>
                  <span>{value ? formatDashboardDate(value) : "Pending"}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="dashboard-empty">Consultation has not been created for this client yet.</p>
        )}

        <div className="consultation-admin-actions">
          <form action={sendConsultationInvite}>
            <input type="hidden" name="clientProfileId" value={clientProfileId} />
            <button type="submit" className="button button-primary">
              {consultation?.sent_at ? "Resend consultation email" : "Send consultation form"}
            </button>
          </form>
          {consultation && (isConsultationCompleteStatus(consultation.status) || Object.keys(responses).length > 0) ? (
            <a className="button button-secondary" href={`/api/admin/clients/${clientProfileId}/consultation/export/`}>
              Download answers PDF
            </a>
          ) : null}
          {consultation?.upload_storage_path ? (
            <a className="button button-secondary" href={`/api/consultation/${clientProfileId}/upload/`}>
              Download uploaded file
            </a>
          ) : null}
          <Link href={`/admin/clients/${clientProfileId}/`} className="button button-secondary">
            Client profile
          </Link>
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Responses{clientName ? ` — ${clientName}` : ""}</h2>
        {consultation && Object.keys(responses).length ? (
          CONSULTATION_STEPS.map((step) => (
            <section key={step.key} className="intake-section">
              <h3>{step.title}</h3>
              <div className="intake-answer-list">
                {step.fields.map((field) => (
                  <article key={field.key} className="intake-answer-item">
                    <p className="intake-question-label">{field.label}</p>
                    <p className="intake-answer-text">{formatAnswer(responses[field.key])}</p>
                    {field.otherKey && responses[field.otherKey] ? (
                      <p className="intake-answer-text">Other: {formatAnswer(responses[field.otherKey])}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="dashboard-empty">No online responses yet.</p>
        )}
      </section>

      <section className="dashboard-panel">
        <h2>Practitioner notes (office use)</h2>
        <form action={savePractitionerConsultationNotes} className="dashboard-form">
          <input type="hidden" name="clientProfileId" value={clientProfileId} />
          <label className="form-field">
            <span>Notes</span>
            <textarea name="practitionerNotes" rows={6} defaultValue={consultation?.practitioner_notes ?? ""} maxLength={5000} />
          </label>
          <label className="consultation-option">
            <input type="checkbox" name="markReviewed" value="1" defaultChecked={Boolean(consultation?.practitioner_reviewed_at)} />
            <span>Mark as reviewed</span>
          </label>
          {consultation?.practitioner_reviewed_at ? (
            <p className="dashboard-inline-note">Reviewed {formatDashboardDate(consultation.practitioner_reviewed_at)}</p>
          ) : null}
          <button type="submit" className="button button-primary">
            Save notes
          </button>
        </form>
      </section>
    </div>
  );
}

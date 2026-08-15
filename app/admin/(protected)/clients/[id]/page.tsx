import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { consultationStatusLabels, isConsultationCompleteStatus } from "@/lib/consultation/schema";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { getAdminClientBundle, getClientConsultation, getClientIntakeSubmission, getClientReadinessAssessment } from "@/lib/dashboard/queries";
import { getClientEngagementSummary } from "@/lib/portal/getClientEngagementSummary";
import { updateClientOperations } from "@/lib/dashboard/adminActions";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> };

const paymentStatusLabels = {
  awaiting_quote: "Awaiting quote",
  invoice_sent: "Invoice sent",
  paid: "Paid",
  payment_plan: "Payment plan",
  on_hold: "On hold",
  not_applicable: "Not applicable",
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({ title: "Client | Admin", description: "Client profile.", path: `/admin/clients/${id}/`, noIndex: true });
}

export default async function AdminClientDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const { clientProfile, profile, enrollment, template } = bundle;
  const [intakeSubmission, consultation, readinessAssessment] = await Promise.all([
    getClientIntakeSubmission(id),
    getClientConsultation(id),
    getClientReadinessAssessment(id),
  ]);

  let engagement = {
    engagementStreak: 0,
    pauseCountThisWeek: 0,
    abstinenceDays: 0,
    showAbstinence: false,
    lastCheckIn: null as Awaited<ReturnType<typeof getClientEngagementSummary>>["lastCheckIn"],
    recentCheckIns: [] as Awaited<ReturnType<typeof getClientEngagementSummary>>["recentCheckIns"],
  };

  try {
    engagement = await getClientEngagementSummary(id, clientProfile.user_id);
  } catch {
    // Soft-fail so missing engagement tables/data cannot 500 the whole profile.
  }

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Client profile</p>
        <h1>{profile?.full_name ?? "Client"}</h1>
        <p>{clientProfile.addiction_slug ? `Focus: ${clientProfile.addiction_slug}` : "Addiction focus not set"}</p>
      </section>
      <div className="dashboard-quick-links">
        <Link href={`/admin/clients/${id}/readiness/`} className="button button-secondary">
          Readiness
        </Link>
        <Link href={`/admin/clients/${id}/intake/`} className="button button-secondary">
          Intake
        </Link>
        <Link href={`/admin/clients/${id}/consultation/`} className="button button-secondary">
          Consultation
        </Link>
        <Link href={`/admin/clients/${id}/programme/`} className="button button-secondary">
          Programme
        </Link>
        {!enrollment ? (
          <Link href={`/admin/clients/${id}/programme/`} className="button button-primary">
            Assign programme
          </Link>
        ) : null}
        <Link href={`/admin/clients/${id}/messages/`} className="button button-secondary">
          Messages
        </Link>
        <Link href={`/admin/clients/${id}/documents/`} className="button button-secondary">
          Documents
        </Link>
      </div>
      <section className="dashboard-panel">
        <h2>Details</h2>
        {saved === "operations" ? <p className="dashboard-inline-note dashboard-success-note">Operations updated.</p> : null}
        {error ? <p className="dashboard-inline-note dashboard-error-note">Could not save that client update.</p> : null}
        <dl className="dashboard-dl">
          <div>
            <dt>Phone</dt>
            <dd>{profile?.phone ?? "—"}</dd>
          </div>
          <div>
            <dt>Preferred contact</dt>
            <dd>{clientProfile.preferred_contact_method ?? "—"}</dd>
          </div>
          <div>
            <dt>Emergency contact</dt>
            <dd>{clientProfile.emergency_contact ?? "—"}</dd>
          </div>
          <div>
            <dt>Programme</dt>
            <dd>{enrollment ? template?.title ?? "Assigned" : "Not enrolled"}</dd>
          </div>
          <div>
            <dt>Readiness</dt>
            <dd>
              {readinessAssessment?.completed_at ? (
                <>
                  <span className="status-badge status-badge-intake-complete">Completed</span>{" "}
                  {formatDashboardDate(readinessAssessment.completed_at)}
                </>
              ) : readinessAssessment ? (
                <span className="status-badge status-badge-intake-in-progress">In progress</span>
              ) : (
                <span className="status-badge status-badge-intake-not-started">Not started</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Intake</dt>
            <dd>
              {intakeSubmission?.completed_at ? (
                <>
                  <span className="status-badge status-badge-intake-complete">Completed</span>{" "}
                  {formatDashboardDate(intakeSubmission.completed_at)}
                </>
              ) : intakeSubmission ? (
                <span className="status-badge status-badge-intake-in-progress">In progress</span>
              ) : (
                <span className="status-badge status-badge-intake-not-started">Not started</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Consultation</dt>
            <dd>
              {consultation ? (
                <>
                  <span className={`status-badge status-badge-consultation-${consultation.status}`}>
                    {consultationStatusLabels[consultation.status]}
                  </span>
                  {!isConsultationCompleteStatus(consultation.status) ? ` · ${consultation.percent_complete}%` : null}
                </>
              ) : (
                <span className="status-badge status-badge-consultation-not_sent">Not sent</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Invitation</dt>
            <dd>
              {clientProfile.invitation_status === "accepted"
                ? `Accepted${clientProfile.invitation_accepted_at ? ` · ${formatDashboardDate(clientProfile.invitation_accepted_at)}` : ""}`
                : clientProfile.invitation_status === "expired"
                  ? "Expired"
                  : `Pending${clientProfile.invited_at ? ` · sent ${formatDashboardDate(clientProfile.invited_at)}` : ""}`}
            </dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>{paymentStatusLabels[clientProfile.payment_status] ?? "Awaiting quote"}</dd>
          </div>
        </dl>
        {readinessAssessment ? (
          <p className="dashboard-inline-note">
            <Link href={`/admin/clients/${id}/readiness/`}>View readiness assessment</Link>
          </p>
        ) : null}
        {intakeSubmission ? (
          <p className="dashboard-inline-note">
            <Link href={`/admin/clients/${id}/intake/`}>View intake responses</Link>
          </p>
        ) : null}
        <p className="dashboard-inline-note">
          <Link href={`/admin/clients/${id}/consultation/`}>View consultation form</Link>
        </p>
        {clientProfile.lead_id ? (
          <p className="dashboard-inline-note">
            <Link href={`/admin/leads/${clientProfile.lead_id}/`}>View originating lead</Link>
          </p>
        ) : null}
      </section>
      <section className="dashboard-panel">
        <h2>Operational checklist</h2>
        <ul className="dashboard-checklist">
          <li className={clientProfile.invitation_status === "accepted" ? "is-complete" : ""}>
            Portal invitation accepted
          </li>
          <li className={intakeSubmission?.completed_at ? "is-complete" : ""}>Intake completed</li>
          <li className={readinessAssessment?.completed_at ? "is-complete" : ""}>Readiness assessment completed</li>
          <li className={enrollment ? "is-complete" : ""}>
            Programme assigned
            {!enrollment ? (
              <>
                {" · "}
                <Link href={`/admin/clients/${id}/programme/`}>Assign now</Link>
              </>
            ) : null}
          </li>
          <li className={consultation && isConsultationCompleteStatus(consultation.status) ? "is-complete" : ""}>
            Consultation completed
          </li>
        </ul>
        {!enrollment ? (
          <p className="dashboard-inline-note">
            Invite does not start the course. After intake and consultation, open{" "}
            <Link href={`/admin/clients/${id}/programme/`}>Programme</Link> and run the Week 1 launch checklist.
          </p>
        ) : null}
        <form action={updateClientOperations} className="dashboard-form">
          <input type="hidden" name="clientProfileId" value={id} />
          <label className="form-field">
            <span>Payment status</span>
            <select name="paymentStatus" defaultValue={clientProfile.payment_status ?? "awaiting_quote"}>
              {Object.entries(paymentStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="button button-secondary">Save operations</button>
        </form>
      </section>
      <section className="dashboard-panel">
        <h2>Portal engagement</h2>
        <dl className="dashboard-dl">
          <div>
            <dt>Rhythm streak</dt>
            <dd>
              {engagement.engagementStreak > 0
                ? `${engagement.engagementStreak} day${engagement.engagementStreak === 1 ? "" : "s"}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Pauses this week</dt>
            <dd>{engagement.pauseCountThisWeek}</dd>
          </div>
          <div>
            <dt>Last check-in</dt>
            <dd>{engagement.lastCheckIn ? formatDashboardDate(engagement.lastCheckIn.created_at) : "—"}</dd>
          </div>
          <div>
            <dt>Days tracked</dt>
            <dd>{engagement.showAbstinence ? `${engagement.abstinenceDays} days` : "Not enabled"}</dd>
          </div>
        </dl>
        {engagement.recentCheckIns.length ? (
          <ul className="portal-home-pulse-list">
            {engagement.recentCheckIns.slice(0, 7).map((checkIn) => (
              <li key={checkIn.id}>
                <span>{checkIn.check_in_date}</span>
                <span>{checkIn.mood}</span>
                <span>Craving {checkIn.craving_level}/5</span>
                {checkIn.pause_taken ? <span className="portal-home-pulse-pause">Pause</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="dashboard-empty">No daily check-ins yet.</p>
        )}
      </section>
    </div>
  );
}


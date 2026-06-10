import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { getAdminClientBundle, getClientIntakeSubmission } from "@/lib/dashboard/queries";
import { getClientEngagementSummary } from "@/lib/portal/getClientEngagementSummary";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({ title: "Client | Admin", description: "Client profile.", path: `/admin/clients/${id}/`, noIndex: true });
}

export default async function AdminClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const { clientProfile, profile, enrollment, template } = bundle;
  const intakeSubmission = await getClientIntakeSubmission(id);
  const engagement = await getClientEngagementSummary(id, clientProfile.user_id);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Client profile</p>
        <h1>{profile?.full_name ?? "Client"}</h1>
        <p>{clientProfile.addiction_slug ? `Focus: ${clientProfile.addiction_slug}` : "Addiction focus not set"}</p>
      </section>
      <div className="dashboard-quick-links">
        <Link href={`/admin/clients/${id}/intake/`} className="button button-secondary">Intake</Link>
        <Link href={`/admin/clients/${id}/programme/`} className="button button-secondary">Programme</Link>
        <Link href={`/admin/clients/${id}/messages/`} className="button button-secondary">Messages</Link>
        <Link href={`/admin/clients/${id}/documents/`} className="button button-secondary">Documents</Link>
      </div>
      <section className="dashboard-panel">
        <h2>Details</h2>
        <dl className="dashboard-dl">
          <div><dt>Phone</dt><dd>{profile?.phone ?? "—"}</dd></div>
          <div><dt>Preferred contact</dt><dd>{clientProfile.preferred_contact_method ?? "—"}</dd></div>
          <div><dt>Emergency contact</dt><dd>{clientProfile.emergency_contact ?? "—"}</dd></div>
          <div><dt>Programme</dt><dd>{enrollment ? template?.title ?? "Assigned" : "Not enrolled"}</dd></div>
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
        </dl>
        {intakeSubmission ? (
          <p className="dashboard-inline-note">
            <Link href={`/admin/clients/${id}/intake/`}>View intake responses</Link>
          </p>
        ) : null}
        {clientProfile.lead_id ? <p className="dashboard-inline-note"><Link href={`/admin/leads/${clientProfile.lead_id}/`}>View originating lead</Link></p> : null}
      </section>
      <section className="dashboard-panel">
        <h2>Portal engagement</h2>
        <dl className="dashboard-dl">
          <div><dt>Rhythm streak</dt><dd>{engagement.engagementStreak > 0 ? `${engagement.engagementStreak} day${engagement.engagementStreak === 1 ? "" : "s"}` : "—"}</dd></div>
          <div><dt>Pauses this week</dt><dd>{engagement.pauseCountThisWeek}</dd></div>
          <div><dt>Last check-in</dt><dd>{engagement.lastCheckIn ? formatDashboardDate(engagement.lastCheckIn.created_at) : "—"}</dd></div>
          <div><dt>Days tracked</dt><dd>{engagement.showAbstinence ? `${engagement.abstinenceDays} days` : "Not enabled"}</dd></div>
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

export async function generateStaticParams() {
  return [];
}


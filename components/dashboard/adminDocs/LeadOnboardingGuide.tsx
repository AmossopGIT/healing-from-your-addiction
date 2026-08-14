import Link from "next/link";
import { AdminDocScreenFrame } from "@/components/dashboard/adminDocs/AdminDocScreenFrame";
import { InviteClientScreenPreview } from "@/components/dashboard/adminDocs/InviteClientScreenPreview";
import { LeadDetailScreenPreview } from "@/components/dashboard/adminDocs/LeadDetailScreenPreview";
import { LeadsListScreenPreview } from "@/components/dashboard/adminDocs/LeadsListScreenPreview";
import { PortalIntakeScreenPreview } from "@/components/dashboard/adminDocs/PortalIntakeScreenPreview";
import { leadOnboardingGuideContent } from "@/lib/adminDocs/leadOnboardingGuideContent";

function StepScreen({ stepId }: { stepId: string }) {
  const guide = leadOnboardingGuideContent;

  switch (stepId) {
    case "leads-list":
      return (
        <AdminDocScreenFrame url={guide.leadsUrl} caption={guide.steps[0].screenCaption}>
          <LeadsListScreenPreview />
        </AdminDocScreenFrame>
      );
    case "lead-detail":
      return (
        <AdminDocScreenFrame url={guide.leadDetailUrl} caption={guide.steps[1].screenCaption}>
          <LeadDetailScreenPreview />
        </AdminDocScreenFrame>
      );
    case "invite":
      return (
        <AdminDocScreenFrame url={guide.inviteUrl} caption={guide.steps[2].screenCaption}>
          <InviteClientScreenPreview />
        </AdminDocScreenFrame>
      );
    case "intake":
      return (
        <AdminDocScreenFrame url={guide.portalIntakeUrl} caption={guide.steps[3].screenCaption}>
          <PortalIntakeScreenPreview />
        </AdminDocScreenFrame>
      );
    default:
      return null;
  }
}

export function LeadOnboardingGuide() {
  const guide = leadOnboardingGuideContent;

  return (
    <div className="admin-doc-guide">
      <section className="admin-doc-guide-intro dashboard-panel">
        <p>{guide.intro}</p>
        <div className="admin-doc-guide-facts">
          {guide.facts.map((fact) => (
            <article key={fact.label} className="admin-doc-fact-card">
              <p className="admin-doc-fact-label">{fact.label}</p>
              <p className="admin-doc-fact-value">{fact.value}</p>
            </article>
          ))}
        </div>
        <div className="admin-doc-callout">
          <strong>Related:</strong>{" "}
          <Link href="/admin/docs/lead-triage-playbook/">Lead triage playbook</Link> for SLA targets and safety
          language · <Link href="/admin/docs/how-to-login-as-admin/">How to log in as admin</Link>
        </div>
      </section>

      {guide.steps.map((step, index) => (
        <section key={step.id} className="admin-doc-step dashboard-panel">
          <div className="admin-doc-step-header">
            <span className="admin-doc-step-badge">{index + 1}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </div>
          <StepScreen stepId={step.id} />
          {step.callout ? <p className="admin-doc-step-note">{step.callout}</p> : null}
        </section>
      ))}

      <section className="dashboard-panel admin-doc-troubleshooting">
        <h2>Entry routes by channel</h2>
        <div className="admin-doc-trouble-grid">
          {guide.channels.map((channel) => (
            <article key={channel.id} className="admin-doc-trouble-card">
              <h3>{channel.title}</h3>
              <p>{channel.summary}</p>
              <ol className="admin-doc-path-steps">
                {channel.steps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-panel admin-doc-checklist">
        <h2>Admin checklist — new person today</h2>
        <ul>
          {guide.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="admin-doc-step-note">Suggested SLA: {guide.sla.join(" · ")}</p>
      </section>

      <section className="dashboard-panel admin-doc-troubleshooting">
        <h2>Common questions</h2>
        <div className="admin-doc-trouble-grid">
          {guide.faqs.map((item) => (
            <article key={item.issue} className="admin-doc-trouble-card">
              <h3>{item.issue}</h3>
              <p>{item.fix}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-panel admin-doc-checklist">
        <h2>Safety reminders</h2>
        <ul>
          {guide.safetyReminders.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="dashboard-panel">
        <h2>Quick routes</h2>
        <div className="dashboard-quick-actions">
          {guide.quickRoutes.map((route) => (
            <Link key={route.path} href={route.path} className="button button-secondary">
              {route.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

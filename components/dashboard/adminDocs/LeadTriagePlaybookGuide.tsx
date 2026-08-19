import Link from "next/link";
import { AdminDocScreenFrame } from "@/components/dashboard/adminDocs/AdminDocScreenFrame";
import { LeadDetailScreenPreview } from "@/components/dashboard/adminDocs/LeadDetailScreenPreview";
import { LeadsListScreenPreview } from "@/components/dashboard/adminDocs/LeadsListScreenPreview";
import { leadTriagePlaybookContent } from "@/lib/adminDocs/leadTriagePlaybookContent";

function StepScreen({ stepId }: { stepId: string }) {
  const guide = leadTriagePlaybookContent;

  switch (stepId) {
    case "overdue":
      return (
        <AdminDocScreenFrame url={guide.overdueLeadsPath} caption={guide.steps[0].screenCaption}>
          <LeadsListScreenPreview />
        </AdminDocScreenFrame>
      );
    case "signals":
    case "respond":
    case "qualified":
      return (
        <AdminDocScreenFrame url={guide.leadDetailPath} caption={guide.steps.find((s) => s.id === stepId)?.screenCaption}>
          <LeadDetailScreenPreview />
        </AdminDocScreenFrame>
      );
    default:
      return null;
  }
}

export function LeadTriagePlaybookGuide() {
  const guide = leadTriagePlaybookContent;

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
          <strong>When they are ready to invite:</strong>{" "}
          <Link href={guide.relatedOnboardingPath}>Lead to client onboarding flow</Link> ·{" "}
          <Link href="/admin/docs/after-invite-start-the-course/">After invite: start the course</Link>
        </div>
      </section>

      <section className="dashboard-panel admin-doc-workflow-panel">
        <h2>Status workflow at a glance</h2>
        <p className="dashboard-inline-note">{guide.workflowLine}</p>
        <div className="admin-doc-status-grid">
          {guide.statusWorkflow.map((item) => (
            <article key={item.status} className="admin-doc-status-card">
              <span className={`status-badge status-badge-${item.status}`}>{item.label}</span>
              <p className="admin-doc-status-meaning">{item.meaning}</p>
              <p className="admin-doc-status-action">
                <strong>Do this:</strong> {item.action}
              </p>
              <p className="admin-doc-status-next">
                <strong>Then:</strong> {item.next}
              </p>
            </article>
          ))}
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

      <section className="dashboard-panel">
        <h2>Response time targets (SLA)</h2>
        <div className="admin-doc-sla-grid">
          {guide.sla.map((item) => (
            <article key={item.level} className="admin-doc-sla-card">
              <p className="admin-doc-sla-level">{item.level}</p>
              <p className="admin-doc-sla-target">{item.target}</p>
              <p className="admin-doc-sla-when">{item.when}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Intake signals to review first</h2>
        <p className="dashboard-inline-note">These fields appear on lead detail — read them before your first message.</p>
        <dl className="admin-doc-signals-list">
          {guide.intakeSignals.map((signal) => (
            <div key={signal.field} className="admin-doc-signal-row">
              <dt>
                <code>{signal.field}</code>
              </dt>
              <dd>{signal.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="dashboard-panel admin-doc-checklist">
        <h2>Triage checklist — every enquiry</h2>
        <ul>
          {guide.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="dashboard-panel admin-doc-checklist">
        <h2>Safety language standards</h2>
        <ul>
          {guide.safetyLanguage.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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

import Link from "next/link";
import { AdminDocScreenFrame } from "@/components/dashboard/adminDocs/AdminDocScreenFrame";
import { AssignProgrammeScreenPreview } from "@/components/dashboard/adminDocs/AssignProgrammeScreenPreview";
import { ClientProgrammeWeek1ScreenPreview } from "@/components/dashboard/adminDocs/ClientProgrammeWeek1ScreenPreview";
import { ProgrammeReleaseScreenPreview } from "@/components/dashboard/adminDocs/ProgrammeReleaseScreenPreview";
import { ProgrammeScheduleScreenPreview } from "@/components/dashboard/adminDocs/ProgrammeScheduleScreenPreview";
import { programmeStartGuideContent } from "@/lib/adminDocs/programmeStartGuideContent";

function StepScreen({ stepId }: { stepId: string }) {
  const guide = programmeStartGuideContent;

  switch (stepId) {
    case "open-programme":
      return (
        <AdminDocScreenFrame url={guide.clientProgrammePath} caption={guide.steps[0].screenCaption}>
          <ClientProgrammeWeek1ScreenPreview />
        </AdminDocScreenFrame>
      );
    case "assign":
      return (
        <AdminDocScreenFrame url={`${guide.clientProgrammePath}#assign`} caption={guide.steps[1].screenCaption}>
          <AssignProgrammeScreenPreview />
        </AdminDocScreenFrame>
      );
    case "release":
      return (
        <AdminDocScreenFrame url={`${guide.clientProgrammePath}#sessions`} caption={guide.steps[2].screenCaption}>
          <ProgrammeReleaseScreenPreview />
        </AdminDocScreenFrame>
      );
    case "schedule":
      return (
        <AdminDocScreenFrame url={`${guide.clientProgrammePath}#schedule`} caption={guide.steps[3].screenCaption}>
          <ProgrammeScheduleScreenPreview />
        </AdminDocScreenFrame>
      );
    default:
      return null;
  }
}

export function ProgrammeStartGuide() {
  const guide = programmeStartGuideContent;

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
          <strong>Before this guide:</strong>{" "}
          <Link href={guide.relatedOnboardingPath}>Lead to client onboarding flow</Link> ·{" "}
          <Link href={guide.relatedTriagePath}>Lead triage playbook</Link>
        </div>
      </section>

      <section className="dashboard-panel admin-doc-journey-map">
        <h2>Where this fits in the journey</h2>
        <p className="dashboard-inline-note">You are here after invite — before the client sees an active “This week” on portal.</p>
        <ol className="admin-doc-journey-steps">
          {guide.journeyMap.map((item, index) => (
            <li key={item.stage} className={item.doc === guide.docPath ? "is-current" : undefined}>
              <span className="admin-doc-journey-index">{index + 1}</span>
              <div>
                <strong>{item.stage}</strong>
                <p>{item.detail}</p>
                {item.doc && item.doc !== guide.docPath ? (
                  <Link href={item.doc} className="admin-doc-journey-link">
                    Open guide →
                  </Link>
                ) : item.doc === guide.docPath ? (
                  <span className="admin-doc-journey-here">You are here</span>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
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
          {step.callout ? (
            <div className="admin-doc-callout">
              <strong>Remember:</strong> {step.callout}
            </div>
          ) : null}
        </section>
      ))}

      <section className="dashboard-panel admin-doc-checklist">
        <h2>Week 1 launch checklist</h2>
        <p className="dashboard-inline-note">
          Work the live checklist on <Link href="/admin/clients/">Clients → Programme</Link>. This page is the coaching
          reference — tick each item on the real Programme page before you tell the client week 1 has started.
        </p>
        <ul>
          {guide.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="dashboard-panel admin-doc-troubleshooting">
        <h2>Troubleshooting</h2>
        <div className="admin-doc-trouble-grid">
          {guide.troubleshooting.map((item) => (
            <article key={item.title} className="admin-doc-trouble-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
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

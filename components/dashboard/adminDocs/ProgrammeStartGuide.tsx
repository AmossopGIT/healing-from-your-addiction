import Link from "next/link";
import { programmeStartGuideContent } from "@/lib/adminDocs/programmeStartGuideContent";

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
          <strong>Related:</strong>{" "}
          <Link href={guide.relatedOnboardingPath}>Lead to client onboarding flow</Link> for invite and intake ·{" "}
          <Link href="/admin/docs/lead-triage-playbook/">Lead triage playbook</Link>
        </div>
      </section>

      <section className="admin-doc-guide-steps">
        {guide.steps.map((step, index) => (
          <article key={step.id} className="dashboard-panel admin-doc-step">
            <p className="eyebrow">Step {index + 1}</p>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
            {step.callout ? (
              <div className="admin-doc-callout">
                <strong>Remember:</strong> {step.callout}
              </div>
            ) : null}
            <p className="dashboard-inline-note">{step.screenCaption}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-panel admin-doc-checklist">
        <h2>Week 1 launch checklist</h2>
        <ul>
          {guide.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="dashboard-inline-note">
          Work the live checklist on{" "}
          <Link href="/admin/clients/">Clients → Programme</Link>. This page is the coaching reference.
        </p>
      </section>

      <section className="dashboard-panel">
        <h2>Troubleshooting</h2>
        <ul className="admin-doc-troubleshooting">
          {guide.troubleshooting.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function ClientProgrammeWeek1ScreenPreview() {
  return (
    <div className="admin-doc-dashboard-preview" aria-hidden="true">
      <aside className="admin-doc-dashboard-sidebar">
        <p className="dashboard-brand-eyebrow">Healing From Your Addiction</p>
        <p className="dashboard-brand-title">Admin dashboard</p>
        <nav className="dashboard-nav">
          <span className="dashboard-nav-link">Clients</span>
          <span className="dashboard-nav-link admin-doc-nav-active">Programme</span>
        </nav>
      </aside>
      <div className="admin-doc-dashboard-main">
        <div className="admin-doc-dashboard-content">
          <section className="dashboard-page-header">
            <p className="eyebrow">Programme</p>
            <h2>Alex M. · Week 1 launch</h2>
            <p className="dashboard-inline-note">3/7 checklist items complete</p>
          </section>
          <div className="admin-doc-preview-panel">
            <p className="admin-doc-preview-panel-title">Week 1 launch checklist</p>
            <ul className="admin-doc-checklist-preview">
              <li className="is-done">Intake submitted</li>
              <li className="is-done">Consultation complete</li>
              <li className="is-current">Assign interactive programme</li>
              <li>Sessions 1–2 with receipts</li>
              <li>Live slot confirmed</li>
            </ul>
          </div>
          <div className="admin-doc-preview-panel admin-doc-next-step-preview">
            <p className="admin-doc-preview-panel-title">What the client sees next</p>
            <strong>Week 1 · Continue journey</strong>
            <p className="dashboard-inline-note">CTA: Open journey → /portal/programme/journey/…</p>
          </div>
        </div>
      </div>
    </div>
  );
}

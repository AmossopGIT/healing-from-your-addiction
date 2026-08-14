export function PortalIntakeScreenPreview() {
  return (
    <div className="admin-doc-portal-preview" aria-hidden="true">
      <div className="admin-doc-portal-preview-inner">
        <section className="dashboard-page-header">
          <p className="eyebrow">Intake</p>
          <h2>Pre-programme questions</h2>
          <p>Answer these questions before your intake conversation. You can save your progress and return anytime.</p>
        </section>
        <div className="admin-doc-preview-panel">
          <p className="admin-doc-preview-panel-title">1. Pattern awareness</p>
          <div className="admin-doc-intake-question">
            <span className="admin-doc-invite-label">When do urges feel strongest?</span>
            <span className="admin-doc-invite-box">Evenings after work…</span>
          </div>
          <div className="admin-doc-intake-question">
            <span className="admin-doc-invite-label">What usually comes just before the urge?</span>
            <span className="admin-doc-invite-box">Stress and boredom…</span>
          </div>
          <div className="admin-doc-preview-cta-row">
            <span className="button button-secondary">Save progress</span>
            <span className="button button-primary">Submit intake</span>
          </div>
        </div>
      </div>
    </div>
  );
}

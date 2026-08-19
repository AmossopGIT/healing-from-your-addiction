export function ProgrammeReleaseScreenPreview() {
  return (
    <div className="admin-doc-dashboard-preview admin-doc-dashboard-preview-compact" aria-hidden="true">
      <div className="admin-doc-dashboard-main">
        <div className="admin-doc-dashboard-content">
          <section className="dashboard-page-header">
            <p className="eyebrow">Sessions &amp; guides</p>
            <h2>Release week 1 materials</h2>
          </section>
          <div className="admin-doc-detail-grid">
            <div className="admin-doc-preview-panel">
              <p className="admin-doc-preview-panel-title">Live sessions</p>
              <ul className="admin-doc-checklist-preview">
                <li className="is-done">Session 1 · Available · Receipt sent</li>
                <li className="is-done">Session 2 · Available · Receipt sent</li>
              </ul>
            </div>
            <div className="admin-doc-preview-panel">
              <p className="admin-doc-preview-panel-title">Week guides</p>
              <p className="dashboard-inline-note">Week 1 guide · Gambling pack</p>
              <span className="button button-small button-secondary">Release to client</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

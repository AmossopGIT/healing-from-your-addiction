export function LeadDetailScreenPreview() {
  return (
    <div className="admin-doc-dashboard-preview" aria-hidden="true">
      <aside className="admin-doc-dashboard-sidebar">
        <p className="dashboard-brand-eyebrow">Healing From Your Addiction</p>
        <p className="dashboard-brand-title">Admin dashboard</p>
        <nav className="dashboard-nav">
          <span className="dashboard-nav-link">Overview</span>
          <span className="dashboard-nav-link admin-doc-nav-active">Leads</span>
          <span className="dashboard-nav-link">Clients</span>
        </nav>
      </aside>
      <div className="admin-doc-dashboard-main">
        <div className="admin-doc-dashboard-content">
          <section className="dashboard-page-header">
            <p className="eyebrow">Lead detail</p>
            <h2>Alex M.</h2>
            <p>
              <span className="status-badge status-badge-qualified">Qualified</span> · Priority
            </p>
            <p className="dashboard-inline-note">
              Next: Use Accept &amp; invite client — status alone cannot create portal access.
            </p>
          </section>
          <div className="admin-doc-detail-grid">
            <div className="admin-doc-preview-panel">
              <p className="admin-doc-preview-panel-title">Contact details</p>
              <dl className="admin-doc-dl-preview">
                <div>
                  <dt>Email</dt>
                  <dd>alex@example.com</dd>
                </div>
                <div>
                  <dt>Preferred contact</dt>
                  <dd>WhatsApp</dd>
                </div>
              </dl>
            </div>
            <div className="admin-doc-preview-panel">
              <p className="admin-doc-preview-panel-title">Follow-up consent</p>
              <dl className="admin-doc-dl-preview">
                <div>
                  <dt>Channels</dt>
                  <dd>WhatsApp: Yes · Email: Yes · Phone: No</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="admin-doc-preview-cta-row">
            <span className="button button-primary">Accept &amp; invite client</span>
            <span className="button button-small button-secondary">Assign to me</span>
          </div>
        </div>
      </div>
    </div>
  );
}

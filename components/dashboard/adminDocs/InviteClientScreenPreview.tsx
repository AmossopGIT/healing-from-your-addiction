export function InviteClientScreenPreview() {
  return (
    <div className="admin-doc-dashboard-preview" aria-hidden="true">
      <aside className="admin-doc-dashboard-sidebar">
        <p className="dashboard-brand-eyebrow">Healing From Your Addiction</p>
        <p className="dashboard-brand-title">Admin dashboard</p>
        <nav className="dashboard-nav">
          <span className="dashboard-nav-link">Leads</span>
          <span className="dashboard-nav-link admin-doc-nav-active">Invite client</span>
          <span className="dashboard-nav-link">Clients</span>
        </nav>
      </aside>
      <div className="admin-doc-dashboard-main">
        <div className="admin-doc-dashboard-content">
          <section className="dashboard-page-header">
            <p className="eyebrow">Client onboarding</p>
            <h2>Invite client</h2>
            <p>Filled from a lead — name and email already set. Blank form = no lead selected.</p>
          </section>
          <div className="admin-doc-preview-panel" style={{ marginBottom: "0.65rem" }}>
            <p className="admin-doc-preview-panel-title">Lead handoff summary</p>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
              Concern: Gambling · Urgency: medium · Callback: evening
            </p>
          </div>
          <div className="admin-doc-invite-form-preview">
            <div className="admin-doc-invite-field">
              <span className="admin-doc-invite-label">Full name</span>
              <span className="admin-doc-invite-box">Alex M.</span>
            </div>
            <div className="admin-doc-invite-field">
              <span className="admin-doc-invite-label">Email</span>
              <span className="admin-doc-invite-box">alex@example.com</span>
            </div>
            <div className="admin-doc-invite-field">
              <span className="admin-doc-invite-label">Addiction focus</span>
              <span className="admin-doc-invite-box">Gambling Addiction</span>
            </div>
            <span className="button button-primary">Send invitation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

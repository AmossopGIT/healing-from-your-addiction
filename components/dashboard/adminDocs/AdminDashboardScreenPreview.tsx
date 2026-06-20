export function AdminDashboardScreenPreview() {
  return (
    <div className="admin-doc-dashboard-preview" aria-hidden="true">
      <aside className="admin-doc-dashboard-sidebar">
        <p className="dashboard-brand-eyebrow">Healing From Your Addiction</p>
        <p className="dashboard-brand-title">Admin dashboard</p>
        <p className="dashboard-brand-subtitle">Lead, client, and content management</p>
        <nav className="dashboard-nav">
          <span className="dashboard-nav-link admin-doc-nav-active">Overview</span>
          <span className="dashboard-nav-link">Analytics</span>
          <span className="dashboard-nav-link">Leads</span>
          <span className="dashboard-nav-link">Clients</span>
          <span className="dashboard-nav-link">Content</span>
          <span className="dashboard-nav-link">Docs</span>
        </nav>
      </aside>
      <div className="admin-doc-dashboard-main">
        <header className="dashboard-topbar">
          <p className="dashboard-topbar-label">Admin workspace</p>
        </header>
        <div className="admin-doc-dashboard-content">
          <section className="dashboard-page-header">
            <p className="eyebrow">Overview</p>
            <h2>Welcome back</h2>
            <p>Review new enquiries, follow up with leads, and manage enrolled clients.</p>
          </section>
          <section className="dashboard-quick-actions">
            <span className="button button-secondary">All leads</span>
            <span className="button button-secondary">Invite client</span>
            <span className="button button-secondary">Content hub</span>
          </section>
        </div>
      </div>
    </div>
  );
}

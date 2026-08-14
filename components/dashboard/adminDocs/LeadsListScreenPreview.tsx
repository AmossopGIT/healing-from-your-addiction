export function LeadsListScreenPreview() {
  return (
    <div className="admin-doc-dashboard-preview" aria-hidden="true">
      <aside className="admin-doc-dashboard-sidebar">
        <p className="dashboard-brand-eyebrow">Healing From Your Addiction</p>
        <p className="dashboard-brand-title">Admin dashboard</p>
        <p className="dashboard-brand-subtitle">Lead, client, and content management</p>
        <nav className="dashboard-nav">
          <span className="dashboard-nav-link">Overview</span>
          <span className="dashboard-nav-link admin-doc-nav-active">Leads</span>
          <span className="dashboard-nav-link">Clients</span>
          <span className="dashboard-nav-link">Docs</span>
        </nav>
      </aside>
      <div className="admin-doc-dashboard-main">
        <header className="dashboard-topbar">
          <p className="dashboard-topbar-label">Admin workspace</p>
        </header>
        <div className="admin-doc-dashboard-content">
          <section className="dashboard-page-header">
            <p className="eyebrow">Leads</p>
            <h2>Enquiries</h2>
            <p>All confidential enquiries submitted from the public site.</p>
          </section>
          <div className="admin-doc-filter-row">
            <span className="admin-doc-filter-chip admin-doc-filter-active">All</span>
            <span className="admin-doc-filter-chip">Overdue</span>
            <span className="admin-doc-filter-chip">New</span>
            <span className="admin-doc-filter-chip">Triage review</span>
          </div>
          <table className="admin-doc-leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Concern</th>
                <th>Triage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alex M.</td>
                <td>Gambling</td>
                <td>priority / priority</td>
                <td>
                  <span className="status-badge status-badge-new">New</span>
                </td>
              </tr>
              <tr>
                <td>Sam R.</td>
                <td>Food / binge eating</td>
                <td>routine / standard</td>
                <td>
                  <span className="status-badge status-badge-outreach_started">Outreach started</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

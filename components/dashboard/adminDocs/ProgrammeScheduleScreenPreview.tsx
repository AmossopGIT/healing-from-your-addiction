export function ProgrammeScheduleScreenPreview() {
  return (
    <div className="admin-doc-dashboard-preview admin-doc-dashboard-preview-compact" aria-hidden="true">
      <div className="admin-doc-dashboard-main">
        <div className="admin-doc-dashboard-content">
          <section className="dashboard-page-header">
            <p className="eyebrow">Schedule</p>
            <h2>Confirm live session slot</h2>
            <p className="dashboard-inline-note">Tuesday or Friday · 11:00 or 16:00</p>
          </section>
          <div className="admin-doc-invite-form-preview">
            <div className="admin-doc-invite-field">
              <span className="admin-doc-invite-label">Preferred slot</span>
              <span className="admin-doc-invite-box">Tuesday · 11:00</span>
            </div>
            <span className="button button-primary">Save schedule</span>
          </div>
          <p className="dashboard-inline-note">Journey can start before the slot is set — live dates need the schedule.</p>
        </div>
      </div>
    </div>
  );
}

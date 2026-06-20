import { adminLoginGuideContent } from "@/lib/adminDocs/adminLoginGuideContent";

export function SiteHeaderLoginPreview() {
  return (
    <div className="admin-doc-header-preview" aria-hidden="true">
      <div className="admin-doc-header-bar">
        <div className="admin-doc-header-brand">
          <span className="admin-doc-header-mark" />
          <span>
            <strong>Healing From Your Addiction</strong>
            <small>Gerald Crawford</small>
          </span>
        </div>
        <div className="admin-doc-header-actions">
          <span className="admin-doc-header-icon" aria-label="Account">
            ○
          </span>
          <span className="admin-doc-header-icon admin-doc-header-icon-active" aria-label="Portal shortcuts">
            ◉
          </span>
        </div>
      </div>
      <div className="admin-doc-header-panel">
        <p className="admin-doc-header-panel-title">Latest resources</p>
        <p className="admin-doc-header-panel-text">
          Read the newest articles here, or log in and create your account from one place.
        </p>
        <div className="admin-doc-header-panel-links">
          <span className="admin-doc-header-panel-link admin-doc-header-panel-link-primary">Log in</span>
          <span className="admin-doc-header-panel-link">Sign up</span>
        </div>
        <p className="admin-doc-header-panel-note">
          Log in opens <code>{adminLoginGuideContent.clientPortalLoginPath}</code> first — not admin yet.
        </p>
      </div>
    </div>
  );
}

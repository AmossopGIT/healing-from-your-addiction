import { adminLoginGuideContent } from "@/lib/adminDocs/adminLoginGuideContent";

export function AdminLoginScreenPreview() {
  const { adminEmail } = adminLoginGuideContent;

  return (
    <div className="admin-doc-auth-preview">
      <div className="auth-card admin-doc-auth-card">
        <p className="eyebrow">Private access</p>
        <h2>Admin sign in</h2>
        <p className="auth-description">Sign in to manage leads, notes, and client invitations.</p>
        <div className="auth-form">
          <label className="form-field">
            <span>Email</span>
            <input type="email" readOnly value={adminEmail} aria-readonly="true" tabIndex={-1} />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input type="password" readOnly value="your-secure-password" aria-readonly="true" tabIndex={-1} />
          </label>
          <button type="button" className="button button-primary form-submit" tabIndex={-1}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

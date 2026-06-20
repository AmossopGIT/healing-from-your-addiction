import Link from "next/link";
import { adminLoginGuideContent } from "@/lib/adminDocs/adminLoginGuideContent";

export function ClientPortalLoginScreenPreview() {
  return (
    <div className="admin-doc-auth-preview">
      <div className="auth-card admin-doc-auth-card">
        <p className="eyebrow">Private access</p>
        <h2>Client portal sign in</h2>
        <p className="auth-description">Sign in to view your programme, resources, and secure messages.</p>
        <div className="auth-form">
          <label className="form-field">
            <span>Email</span>
            <input type="email" readOnly value="client@example.com" aria-readonly="true" tabIndex={-1} />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input type="password" readOnly value="password" aria-readonly="true" tabIndex={-1} />
          </label>
          <button type="button" className="button button-primary form-submit" tabIndex={-1}>
            Sign in
          </button>
        </div>
        <p className="auth-description">
          <span>Create an account</span>
          {" · "}
          <span>Forgot your password?</span>
        </p>
        <p className="auth-alt-link admin-doc-staff-link-highlight">
          <Link href={adminLoginGuideContent.adminLoginPath}>Staff admin sign in</Link>
        </p>
      </div>
    </div>
  );
}

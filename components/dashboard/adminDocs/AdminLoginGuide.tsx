import Link from "next/link";
import { AdminDashboardScreenPreview } from "@/components/dashboard/adminDocs/AdminDashboardScreenPreview";
import { AdminDocScreenFrame } from "@/components/dashboard/adminDocs/AdminDocScreenFrame";
import { AdminLoginScreenPreview } from "@/components/dashboard/adminDocs/AdminLoginScreenPreview";
import { ClientPortalLoginScreenPreview } from "@/components/dashboard/adminDocs/ClientPortalLoginScreenPreview";
import { SiteHeaderLoginPreview } from "@/components/dashboard/adminDocs/SiteHeaderLoginPreview";
import { adminLoginGuideContent } from "@/lib/adminDocs/adminLoginGuideContent";

export function AdminLoginGuide() {
  const guide = adminLoginGuideContent;
  const headerPath = guide.accessPaths.find((path) => path.id === "header");

  return (
    <div className="admin-doc-guide">
      <section className="admin-doc-guide-intro dashboard-panel">
        <p>
          Use this guide when you need to sign in to the private admin dashboard. Admin access is separate from the
          client portal. You can open admin sign-in directly, or start from the public site header and use{" "}
          <strong>Staff admin sign in</strong> on the client portal card.
        </p>
        <div className="admin-doc-guide-facts">
          <article className="admin-doc-fact-card">
            <p className="admin-doc-fact-label">Admin sign-in URL</p>
            <p className="admin-doc-fact-value">
              <Link href={guide.adminLoginPath}>{guide.adminLoginUrl}</Link>
            </p>
          </article>
          <article className="admin-doc-fact-card">
            <p className="admin-doc-fact-label">Admin email</p>
            <p className="admin-doc-fact-value">
              <code>{guide.adminEmail}</code>
            </p>
          </article>
        </div>
      </section>

      {guide.steps.map((step, index) => (
        <section key={step.title} className="admin-doc-step dashboard-panel">
          <div className="admin-doc-step-header">
            <span className="admin-doc-step-badge">{index + 1}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.body}</p>
            </div>
          </div>

          {index === 0 ? (
            <div className="admin-doc-path-grid">
              <article className="admin-doc-path-card">
                <h3>Option A — Direct admin link</h3>
                <p>Open the admin URL in your browser.</p>
                <AdminDocScreenFrame
                  url={guide.adminLoginUrl}
                  caption="The dedicated admin sign-in page at healingfromyouraddiction.co.za/admin/login/."
                >
                  <AdminLoginScreenPreview />
                </AdminDocScreenFrame>
              </article>

              <article className="admin-doc-path-card">
                <h3>Option B — From the public site header</h3>
                <p>{headerPath?.summary}</p>
                {headerPath?.headerSteps ? (
                  <ol className="admin-doc-path-steps">
                    {headerPath.headerSteps.map((headerStep) => (
                      <li key={headerStep}>{headerStep}</li>
                    ))}
                  </ol>
                ) : null}
                <AdminDocScreenFrame
                  url={guide.clientPortalLoginUrl.replace("/portal/login/", "/")}
                  caption="Step 1: click the account or bell icon in the top-right header, then choose Log in."
                >
                  <SiteHeaderLoginPreview />
                </AdminDocScreenFrame>
                <AdminDocScreenFrame
                  url={guide.clientPortalLoginUrl}
                  caption='Step 2: on the client portal card, click "Staff admin sign in" at the bottom.'
                >
                  <ClientPortalLoginScreenPreview />
                </AdminDocScreenFrame>
              </article>
            </div>
          ) : null}

          {index === 1 ? (
            <>
              <AdminDocScreenFrame
                url={guide.adminLoginUrl}
                caption="Enter the admin email assigned to your account, then your password."
              >
                <AdminLoginScreenPreview />
              </AdminDocScreenFrame>
              <div className="admin-doc-callout">
                <strong>First-time sign-in?</strong> If no password was set when your account was created, use{" "}
                <strong>Forgot password</strong> on the admin login page after your administrator confirms the account
                exists.
              </div>
            </>
          ) : null}

          {index === 2 ? (
            <AdminDocScreenFrame
              url={`${guide.adminLoginUrl.replace("/admin/login/", "/admin/")}`}
              caption="You should land on the admin overview with the teal sidebar — not the client portal home."
            >
              <AdminDashboardScreenPreview />
            </AdminDocScreenFrame>
          ) : null}

          {step.callout ? <p className="admin-doc-step-note">{step.callout}</p> : null}
        </section>
      ))}

      <section className="dashboard-panel admin-doc-checklist">
        <h2>After sign-in checklist</h2>
        <ul>
          {guide.smokeChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="dashboard-panel admin-doc-troubleshooting">
        <h2>Troubleshooting</h2>
        <div className="admin-doc-trouble-grid">
          {guide.troubleshooting.map((item) => (
            <article key={item.issue} className="admin-doc-trouble-card">
              <h3>{item.issue}</h3>
              <p>{item.fix}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { withBasePath } from "@/lib/basePath";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Offline | Healing From Your Addiction",
  description: "Reconnect to continue browsing or return to your last available page.",
  path: "/offline/",
  noIndex: true,
});

export default function OfflinePage() {
  return (
    <section className="section-band offline-page" aria-labelledby="offline-page-heading">
      <div className="container">
        <div className="offline-card">
          <p className="eyebrow">Offline</p>
          <h1 id="offline-page-heading">You are temporarily offline</h1>
          <p className="section-intro narrow">
            Public pages you have already opened may still be available. Secure portal pages need a live connection
            before they can refresh or unlock new content.
          </p>
          <div className="button-row">
            <a className="button button-primary" href={withBasePath("/")}>
              Return home
            </a>
            <a className="button button-secondary" href={withBasePath("/contact/")}>
              Contact options
            </a>
          </div>
          <p className="offline-note">Once your connection returns, reload the page to sync the latest content.</p>
        </div>
      </div>
    </section>
  );
}

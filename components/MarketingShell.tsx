import type { ReactNode } from "react";
import { AnalyticsCollector } from "@/components/analytics/AnalyticsCollector";
import { AnalyticsEngagementTracker } from "@/components/analytics/AnalyticsEngagementTracker";
import { ConsentRestore } from "@/components/analytics/ConsentRestore";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarketingEnhancements } from "@/components/MarketingEnhancements";
import { PageSeoContextScript } from "@/components/PageSeoContextScript";
import { SkipLink } from "@/components/SkipLink";
import type { SeoPageRecord } from "@/content/seo";
import { withBasePath } from "@/lib/basePath";

export function MarketingShell({
  children,
  currentPath,
  pageSeo,
}: {
  children: ReactNode;
  currentPath: string;
  pageSeo?: SeoPageRecord;
}) {
  const pageOwnsSeoContext = /^\/(blog|case-studies)\/[^/]+\/$/.test(currentPath);

  return (
    <>
      <SkipLink />
      {pageSeo && !pageOwnsSeoContext ? <PageSeoContextScript pageSeo={pageSeo} /> : null}
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <AnalyticsCollector />
      <AnalyticsEngagementTracker />
      <ConsentRestore />
      <CookieConsentBanner />
      <MarketingEnhancements
        currentPath={currentPath}
        serviceWorkerUrl={withBasePath("/sw.js")}
        subscribeUrl={withBasePath("/api/push/subscribe/")}
        unsubscribeUrl={withBasePath("/api/push/subscribe/")}
        pushPublicKey={process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY}
      />
    </>
  );
}

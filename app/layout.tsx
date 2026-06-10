import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getRequestSurface } from "@/lib/appSurface.server";
import { createPageMetadata, createViewport } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { ConsentModeScript } from "@/components/analytics/ConsentModeScript";
import { headers } from "next/headers";
import Script from "next/script";
import { seoPages, getSeoByPath } from "@/content/seo";
import "./globals.css";

export const metadata: Metadata = createPageMetadata(seoPages.home);
export const viewport = createViewport();

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-KN8WMGXR";
  const appSurface = await getRequestSurface();
  const requestHeaders = await headers();
  const currentPath = requestHeaders.get("x-current-path") ?? "/";
  const pageSeo = appSurface === "public" ? getSeoByPath(currentPath) : undefined;

  return (
    <html lang="en-ZA" suppressHydrationWarning>
      <head>
        {gtmId && appSurface === "public" ? <ConsentModeScript /> : null}
        {gtmId && appSurface === "public" ? (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
      </head>
      <body>
        {gtmId && appSurface === "public" ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        {appSurface === "public" ? (
          <MarketingShell currentPath={currentPath} pageSeo={pageSeo}>{children}</MarketingShell>
        ) : (
          children
        )}
      </body>
    </html>
  );
}


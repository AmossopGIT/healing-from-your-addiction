import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { MarketingShell } from "@/components/MarketingShell";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = createPageMetadata(seoPages.home);

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-KN8WMGXR";

  return (
    <html lang="en-ZA">
      <head>
        {gtmId ? (
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
        {gtmId ? (
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
        <MarketingShell>{children}</MarketingShell>
      </body>
    </html>
  );
}


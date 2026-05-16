import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { ChatLeadWidget } from "@/components/ChatLeadWidget";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = createPageMetadata(seoPages.home);

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en-ZA">
      <body>
        {gtmId ? (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        ) : null}
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
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyMobileCTA />
        <ChatLeadWidget />
      </body>
    </html>
  );
}


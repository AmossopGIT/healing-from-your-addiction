import Script from "next/script";

export function ConsentModeScript() {
  return (
    <Script id="consent-mode-defaults" strategy="beforeInteractive">
      {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
`}
    </Script>
  );
}

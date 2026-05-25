import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarketingEnhancements } from "@/components/MarketingEnhancements";
import { withBasePath } from "@/lib/basePath";

export function MarketingShell({
  children,
  currentPath,
}: {
  children: ReactNode;
  currentPath: string;
}) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
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

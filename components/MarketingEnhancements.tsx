"use client";

import dynamic from "next/dynamic";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

const ChatLeadWidget = dynamic(
  () => import("@/components/ChatLeadWidget").then((mod) => mod.ChatLeadWidget),
  { ssr: false },
);

const PwaClientManager = dynamic(
  () => import("@/components/pwa/PwaClientManager").then((mod) => mod.PwaClientManager),
  { ssr: false },
);

type MarketingEnhancementsProps = {
  currentPath: string;
  pushPublicKey?: string;
  serviceWorkerUrl: string;
  subscribeUrl: string;
  unsubscribeUrl: string;
};

export function MarketingEnhancements({
  currentPath,
  pushPublicKey,
  serviceWorkerUrl,
  subscribeUrl,
  unsubscribeUrl,
}: MarketingEnhancementsProps) {
  return (
    <>
      <StickyMobileCTA />
      <ChatLeadWidget />
      <PwaClientManager
        currentPath={currentPath}
        serviceWorkerUrl={serviceWorkerUrl}
        subscribeUrl={subscribeUrl}
        unsubscribeUrl={unsubscribeUrl}
        pushPublicKey={pushPublicKey}
      />
    </>
  );
}

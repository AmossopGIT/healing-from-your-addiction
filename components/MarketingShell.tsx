"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ChatLeadWidget } from "@/components/ChatLeadWidget";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";

export function MarketingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith("/admin") || pathname?.startsWith("/portal");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <StickyMobileCTA />
      <ChatLeadWidget />
    </>
  );
}

import type { ReactNode } from "react";

export default function PortalSessionLayout({ children }: { children: ReactNode }) {
  return children;
}

export async function generateStaticParams() {
  return [];
}

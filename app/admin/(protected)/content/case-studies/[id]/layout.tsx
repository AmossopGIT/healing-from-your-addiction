import type { ReactNode } from "react";

export default function AdminCaseStudyIdLayout({ children }: { children: ReactNode }) {
  return children;
}

export async function generateStaticParams() {
  return [];
}

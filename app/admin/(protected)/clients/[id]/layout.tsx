import type { ReactNode } from "react";

export default function AdminClientIdLayout({ children }: { children: ReactNode }) {
  return children;
}

export async function generateStaticParams() {
  return [];
}

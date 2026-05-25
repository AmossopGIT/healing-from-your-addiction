import type { ReactNode } from "react";

export default function AdminBlogIdLayout({ children }: { children: ReactNode }) {
  return children;
}

export async function generateStaticParams() {
  return [];
}

"use client";

import Link from "next/link";
import { pushDataLayer } from "@/lib/tracking";

type BlogInternalLinkProps = {
  href: string;
  label: string;
  sourceSlug?: string;
};

export function BlogInternalLink({ href, label, sourceSlug }: BlogInternalLinkProps) {
  return (
    <Link
      href={href}
      data-analytics-tracked
      onClick={() => {
        pushDataLayer("blog_internal_link_click", {
          source_slug: sourceSlug ?? null,
          destination_path: href,
          link_text: label,
          link_section: "blog_body",
        });
      }}
    >
      {label}
    </Link>
  );
}

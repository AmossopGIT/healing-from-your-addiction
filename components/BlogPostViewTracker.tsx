"use client";

import { useEffect } from "react";
import { pushDataLayer } from "@/lib/tracking";

type BlogPostViewTrackerProps = {
  slug: string;
  categorySlug: string;
  primaryKeyword: string;
};

export function BlogPostViewTracker({ slug, categorySlug, primaryKeyword }: BlogPostViewTrackerProps) {
  useEffect(() => {
    pushDataLayer("blog_post_view", {
      blog_slug: slug,
      blog_category: categorySlug,
      primary_keyword: primaryKeyword,
    });
  }, [slug, categorySlug, primaryKeyword]);

  return null;
}

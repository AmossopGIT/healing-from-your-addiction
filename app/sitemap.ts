import type { MetadataRoute } from "next";
import { blogCategories, blogCategoryPath, blogPath, blogPosts, blogTagPath, blogTags } from "@/content/blog";
import { caseStudies, caseStudyPath } from "@/content/caseStudies";
import { seoPageList } from "@/content/seo";
import { absoluteUrl } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const seoRoutes = seoPageList.filter((page) => !page.noIndex).map((page) => page.path);
  const blogRoutes = [
    "/blog/",
    ...blogPosts.map((post) => blogPath(post.slug)),
    ...blogCategories.map((category) => blogCategoryPath(category.slug)),
    ...blogTags.map((tag) => blogTagPath(tag.slug)),
  ];
  const caseStudyRoutes = [
    "/case-studies/",
    ...caseStudies.map((study) => caseStudyPath(study.slug)),
  ];
  const allRoutes = [...new Set([...seoRoutes, ...blogRoutes, ...caseStudyRoutes])];

  return allRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}

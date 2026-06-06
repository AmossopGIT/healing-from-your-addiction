import { blogPosts } from "@/content/blog";
import { caseStudies } from "@/content/caseStudies";
import type { CmsBlogPostRow, CmsCaseStudyRow } from "@/types/cms";

export type StaticInventorySummary = {
  staticBlogCount: number;
  staticCaseStudyCount: number;
  cmsBlogCount: number;
  cmsCaseStudyCount: number;
  cmsPublishedBlogCount: number;
  cmsPublishedCaseStudyCount: number;
  cmsDraftBlogCount: number;
  missingBlogSlugs: string[];
  missingCaseStudySlugs: string[];
};

export function buildStaticInventory(
  cmsBlogPosts: CmsBlogPostRow[],
  cmsCaseStudies: CmsCaseStudyRow[],
): StaticInventorySummary {
  const cmsBlogSlugs = new Set(cmsBlogPosts.map((post) => post.slug));
  const cmsCaseStudySlugs = new Set(cmsCaseStudies.map((study) => study.slug));

  const staticBlogSlugs = blogPosts.map((post) => post.slug);
  const staticCaseStudySlugs = caseStudies.map((study) => study.slug);

  return {
    staticBlogCount: blogPosts.length,
    staticCaseStudyCount: caseStudies.length,
    cmsBlogCount: cmsBlogPosts.length,
    cmsCaseStudyCount: cmsCaseStudies.length,
    cmsPublishedBlogCount: cmsBlogPosts.filter((post) => post.workflow_status === "published").length,
    cmsPublishedCaseStudyCount: cmsCaseStudies.filter((study) => study.workflow_status === "published").length,
    cmsDraftBlogCount: cmsBlogPosts.filter((post) => post.workflow_status === "draft").length,
    missingBlogSlugs: staticBlogSlugs.filter((slug) => !cmsBlogSlugs.has(slug)),
    missingCaseStudySlugs: staticCaseStudySlugs.filter((slug) => !cmsCaseStudySlugs.has(slug)),
  };
}

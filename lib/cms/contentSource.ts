import { cache } from "react";
import {
  blogPosts as staticBlogPosts,
  blogPostBySlug as staticBlogPostBySlug,
  type BlogPost,
} from "@/content/blog";
import {
  caseStudies as staticCaseStudies,
  caseStudyBySlug as staticCaseStudyBySlug,
} from "@/content/caseStudies";
import type { CaseStudy } from "@/content/caseStudies";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { cmsBlogPostToBlogPost, cmsCaseStudyToCaseStudy } from "@/lib/cms/mappers";
import {
  fetchCmsBlogPostBySlug,
  fetchCmsCaseStudyBySlug,
  fetchPublishedCmsBlogPosts,
  fetchPublishedCmsCaseStudies,
} from "@/lib/cms/queries";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import type { CmsBlogPostRow, CmsCaseStudyRow } from "@/types/cms";

function cmsReady() {
  return isCmsContentEnabled() && isSupabaseServiceConfigured();
}

const getPublishedCmsBlogRows = cache(async (): Promise<CmsBlogPostRow[]> => {
  if (!cmsReady()) return [];
  return fetchPublishedCmsBlogPosts();
});

const getPublishedCmsCaseStudyRows = cache(async (): Promise<CmsCaseStudyRow[]> => {
  if (!cmsReady()) return [];
  return fetchPublishedCmsCaseStudies();
});

export const getMergedBlogPosts = cache(async (): Promise<BlogPost[]> => {
  if (!cmsReady()) return staticBlogPosts;

  const cmsRows = await getPublishedCmsBlogRows();
  const cmsSlugs = new Set(cmsRows.map((row) => row.slug));
  const cmsPosts = cmsRows.map(cmsBlogPostToBlogPost);
  const staticOnly = staticBlogPosts.filter((post) => !cmsSlugs.has(post.slug));
  return [...cmsPosts, ...staticOnly].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
});

export async function getMergedBlogPostBySlug(slug: string): Promise<{ post: BlogPost; cmsRow: CmsBlogPostRow | null } | null> {
  if (cmsReady()) {
    const cachedRow = (await getPublishedCmsBlogRows()).find((row) => row.slug === slug) ?? null;
    const cmsRow = cachedRow ?? (await fetchCmsBlogPostBySlug(slug, true));
    if (cmsRow) {
      return { post: cmsBlogPostToBlogPost(cmsRow), cmsRow };
    }
  }

  const staticPost = staticBlogPostBySlug.get(slug);
  if (staticPost) {
    return { post: staticPost, cmsRow: null };
  }
  return null;
}

export const getMergedCaseStudies = cache(async (): Promise<CaseStudy[]> => {
  if (!cmsReady()) return staticCaseStudies;

  const cmsRows = await getPublishedCmsCaseStudyRows();
  const cmsSlugs = new Set(cmsRows.map((row) => row.slug));
  const cmsStudies = cmsRows.map(cmsCaseStudyToCaseStudy);
  const staticOnly = staticCaseStudies.filter((study) => !cmsSlugs.has(study.slug));
  return [...cmsStudies, ...staticOnly].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
});

export async function getMergedCaseStudyBySlug(slug: string): Promise<{ study: CaseStudy; cmsRow: CmsCaseStudyRow | null } | null> {
  if (cmsReady()) {
    const cachedRow = (await getPublishedCmsCaseStudyRows()).find((row) => row.slug === slug) ?? null;
    const cmsRow = cachedRow ?? (await fetchCmsCaseStudyBySlug(slug, true));
    if (cmsRow) {
      return { study: cmsCaseStudyToCaseStudy(cmsRow), cmsRow };
    }
  }

  const staticStudy = staticCaseStudyBySlug.get(slug);
  if (staticStudy) {
    return { study: staticStudy, cmsRow: null };
  }
  return null;
}

export async function getMergedPostsByCategory(categorySlug: string) {
  const posts = await getMergedBlogPosts();
  return posts.filter((post) => post.categorySlug === categorySlug);
}

export async function getMergedPostsByTag(tagSlug: string) {
  const posts = await getMergedBlogPosts();
  return posts.filter((post) => post.tagSlugs.includes(tagSlug));
}

export async function getMergedFeaturedCaseStudies(limit = 3) {
  const studies = await getMergedCaseStudies();
  return studies.filter((study) => study.caseStudyType === "outcome").slice(0, limit);
}

export async function getMergedCaseStudiesByType(type: CaseStudy["caseStudyType"]) {
  const studies = await getMergedCaseStudies();
  return studies.filter((study) => study.caseStudyType === type);
}

export async function getMergedCaseStudiesByAddiction(addictionSlug: string) {
  const studies = await getMergedCaseStudies();
  return studies.filter((study) => study.addictionSlug === addictionSlug);
}

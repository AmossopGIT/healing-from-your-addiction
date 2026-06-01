import { fetchAllCmsBlogPosts, fetchAllCmsCaseStudies } from "@/lib/cms/queries";
import { cmsWorkflowStatusLabels } from "@/types/cms";
import type { CmsBlogPostRow, CmsCaseStudyRow, CmsWorkflowStatus } from "@/types/cms";

const SEARCH_MAX_LENGTH = 80;

export type CmsListFilters = {
  status?: string;
  q?: string;
};

function sanitizeSearchQuery(value: string | undefined) {
  const trimmed = (value ?? "").trim().slice(0, SEARCH_MAX_LENGTH);
  return trimmed.length >= 2 ? trimmed : "";
}

function isValidWorkflowStatus(value: string | undefined): value is CmsWorkflowStatus {
  return Boolean(value && value in cmsWorkflowStatusLabels);
}

function filterByTitle<T extends { title: string }>(items: T[], query: string) {
  const lower = query.toLowerCase();
  return items.filter((item) => item.title.toLowerCase().includes(lower));
}

export async function fetchCmsBlogList(filters: CmsListFilters): Promise<{
  posts: CmsBlogPostRow[];
  filters: CmsListFilters;
  totalCount: number;
}> {
  const searchQuery = sanitizeSearchQuery(filters.q);
  const statusFilter = isValidWorkflowStatus(filters.status) ? filters.status : undefined;

  let posts = await fetchAllCmsBlogPosts(true);
  if (statusFilter) {
    posts = posts.filter((post) => post.workflow_status === statusFilter);
  }
  if (searchQuery) {
    posts = filterByTitle(posts, searchQuery);
  }

  return { posts, filters, totalCount: posts.length };
}

export async function fetchCmsCaseStudyList(filters: CmsListFilters): Promise<{
  studies: CmsCaseStudyRow[];
  filters: CmsListFilters;
  totalCount: number;
}> {
  const searchQuery = sanitizeSearchQuery(filters.q);
  const statusFilter = isValidWorkflowStatus(filters.status) ? filters.status : undefined;

  let studies = await fetchAllCmsCaseStudies(true);
  if (statusFilter) {
    studies = studies.filter((study) => study.workflow_status === statusFilter);
  }
  if (searchQuery) {
    studies = filterByTitle(studies, searchQuery);
  }

  return { studies, filters, totalCount: studies.length };
}

export const cmsWorkflowFilterStatuses: CmsWorkflowStatus[] = [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "archived",
];

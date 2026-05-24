import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import type { CmsBlogPostRow, CmsCaseStudyRow, CmsWorkflowEventRow } from "@/types/cms";

const publishedStatuses = ["published", "scheduled"] as const;

function isPubliclyVisible(row: { workflow_status: string; scheduled_for: string | null }) {
  if (row.workflow_status === "published") return true;
  if (row.workflow_status === "scheduled" && row.scheduled_for) {
    return new Date(row.scheduled_for) <= new Date();
  }
  return false;
}

async function getReadClient(useServiceRole: boolean) {
  if (useServiceRole && isSupabaseServiceConfigured()) {
    return createServiceClient();
  }
  return createClient();
}

async function safeQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch {
    return fallback;
  }
}

export async function fetchAllCmsBlogPosts(admin = false): Promise<CmsBlogPostRow[]> {
  return safeQuery(async () => {
    const supabase = await getReadClient(!admin);
    const { data, error } = await supabase.from("cms_blog_posts").select("*").order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as CmsBlogPostRow[];
  }, []);
}

export async function fetchPublishedCmsBlogPosts(): Promise<CmsBlogPostRow[]> {
  return safeQuery(async () => {
    const supabase = await getReadClient(true);
    const { data, error } = await supabase.from("cms_blog_posts").select("*");
    if (error) throw new Error(error.message);
    return ((data ?? []) as CmsBlogPostRow[]).filter(isPubliclyVisible).sort((a, b) => {
      const aDate = a.published_at ?? a.updated_at;
      const bDate = b.published_at ?? b.updated_at;
      return aDate < bDate ? 1 : -1;
    });
  }, []);
}

export async function fetchCmsBlogPostById(id: string): Promise<CmsBlogPostRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cms_blog_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CmsBlogPostRow | null) ?? null;
}

export async function fetchCmsBlogPostBySlug(slug: string, publicOnly = false): Promise<CmsBlogPostRow | null> {
  const supabase = await getReadClient(publicOnly);
  const { data, error } = await supabase.from("cms_blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as CmsBlogPostRow | null;
  if (!row) return null;
  if (publicOnly && !isPubliclyVisible(row)) return null;
  return row;
}

export async function fetchAllCmsCaseStudies(admin = false): Promise<CmsCaseStudyRow[]> {
  return safeQuery(async () => {
    const supabase = await getReadClient(!admin);
    const { data, error } = await supabase.from("cms_case_studies").select("*").order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as CmsCaseStudyRow[];
  }, []);
}

export async function fetchPublishedCmsCaseStudies(): Promise<CmsCaseStudyRow[]> {
  return safeQuery(async () => {
    const supabase = await getReadClient(true);
    const { data, error } = await supabase.from("cms_case_studies").select("*");
    if (error) throw new Error(error.message);
    return ((data ?? []) as CmsCaseStudyRow[]).filter(isPubliclyVisible).sort((a, b) => {
      const aDate = a.published_at ?? a.updated_at;
      const bDate = b.published_at ?? b.updated_at;
      return aDate < bDate ? 1 : -1;
    });
  }, []);
}

export async function fetchCmsCaseStudyById(id: string): Promise<CmsCaseStudyRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cms_case_studies").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CmsCaseStudyRow | null) ?? null;
}

export async function fetchCmsCaseStudyBySlug(slug: string, publicOnly = false): Promise<CmsCaseStudyRow | null> {
  const supabase = await getReadClient(publicOnly);
  const { data, error } = await supabase.from("cms_case_studies").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as CmsCaseStudyRow | null;
  if (!row) return null;
  if (publicOnly && !isPubliclyVisible(row)) return null;
  return row;
}

export async function fetchWorkflowEvents(contentType: "blog_post" | "case_study", contentId: string): Promise<CmsWorkflowEventRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_workflow_events")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as CmsWorkflowEventRow[];
  } catch {
    return [];
  }
}

export { publishedStatuses, isPubliclyVisible };

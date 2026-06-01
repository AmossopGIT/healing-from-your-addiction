import { fetchAllCmsBlogPosts, fetchAllCmsCaseStudies } from "@/lib/cms/queries";
import { isLeadAwaitingFirstResponse, isLeadOverdue } from "@/lib/dashboard/leadSla";
import { leadStatusOptions } from "@/lib/dashboard/constants";
import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus, Profile } from "@/types/database";
import type { CmsWorkflowStatus } from "@/types/cms";

export type CmsAttentionItem = {
  id: string;
  contentType: "blog" | "case-study";
  title: string;
  workflowStatus: CmsWorkflowStatus;
  scheduledFor: string | null;
  updatedAt: string;
  editHref: string;
  reason: "in_review" | "scheduled_soon";
};

export type AdminOverviewBundle = {
  counts: {
    newLeads: number;
    enrolledClients: number;
    overdueLeads: number;
    awaitingFirstResponse: number;
    openPipeline: number;
  };
  pipelineByStatus: Record<LeadStatus, number>;
  triageByPriority: Record<string, number>;
  triageByRisk: Record<string, number>;
  overdueLeads: Lead[];
  recentLeads: Lead[];
  cmsWorkflowCounts: Record<CmsWorkflowStatus, number>;
  cmsAttention: CmsAttentionItem[];
};

const CMS_WORKFLOW_STATUSES: CmsWorkflowStatus[] = [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "archived",
];

const SCHEDULED_SOON_MS = 7 * 24 * 60 * 60 * 1000;

function emptyPipelineCounts(): Record<LeadStatus, number> {
  return Object.fromEntries(leadStatusOptions.map((status) => [status, 0])) as Record<LeadStatus, number>;
}

function emptyCmsWorkflowCounts(): Record<CmsWorkflowStatus, number> {
  return Object.fromEntries(CMS_WORKFLOW_STATUSES.map((status) => [status, 0])) as Record<CmsWorkflowStatus, number>;
}

function buildCmsAttention(
  blogPosts: Awaited<ReturnType<typeof fetchAllCmsBlogPosts>>,
  caseStudies: Awaited<ReturnType<typeof fetchAllCmsCaseStudies>>,
): { cmsWorkflowCounts: Record<CmsWorkflowStatus, number>; cmsAttention: CmsAttentionItem[] } {
  const cmsWorkflowCounts = emptyCmsWorkflowCounts();
  const now = Date.now();
  const attention: CmsAttentionItem[] = [];

  for (const post of blogPosts) {
    cmsWorkflowCounts[post.workflow_status] += 1;
    if (post.workflow_status === "in_review") {
      attention.push({
        id: post.id,
        contentType: "blog",
        title: post.title,
        workflowStatus: post.workflow_status,
        scheduledFor: post.scheduled_for,
        updatedAt: post.updated_at,
        editHref: `/admin/content/blog/${post.id}/`,
        reason: "in_review",
      });
    } else if (
      post.workflow_status === "scheduled" &&
      post.scheduled_for &&
      new Date(post.scheduled_for).getTime() - now <= SCHEDULED_SOON_MS
    ) {
      attention.push({
        id: post.id,
        contentType: "blog",
        title: post.title,
        workflowStatus: post.workflow_status,
        scheduledFor: post.scheduled_for,
        updatedAt: post.updated_at,
        editHref: `/admin/content/blog/${post.id}/`,
        reason: "scheduled_soon",
      });
    }
  }

  for (const study of caseStudies) {
    cmsWorkflowCounts[study.workflow_status] += 1;
    if (study.workflow_status === "in_review") {
      attention.push({
        id: study.id,
        contentType: "case-study",
        title: study.title,
        workflowStatus: study.workflow_status,
        scheduledFor: study.scheduled_for,
        updatedAt: study.updated_at,
        editHref: `/admin/content/case-studies/${study.id}/`,
        reason: "in_review",
      });
    } else if (
      study.workflow_status === "scheduled" &&
      study.scheduled_for &&
      new Date(study.scheduled_for).getTime() - now <= SCHEDULED_SOON_MS
    ) {
      attention.push({
        id: study.id,
        contentType: "case-study",
        title: study.title,
        workflowStatus: study.workflow_status,
        scheduledFor: study.scheduled_for,
        updatedAt: study.updated_at,
        editHref: `/admin/content/case-studies/${study.id}/`,
        reason: "scheduled_soon",
      });
    }
  }

  attention.sort((a, b) => {
    if (a.reason !== b.reason) {
      return a.reason === "in_review" ? -1 : 1;
    }
    const aTime = a.scheduledFor ?? a.updatedAt;
    const bTime = b.scheduledFor ?? b.updatedAt;
    return aTime < bTime ? -1 : 1;
  });

  return { cmsWorkflowCounts, cmsAttention: attention.slice(0, 8) };
}

export async function fetchAdminProfiles(): Promise<Pick<Profile, "id" | "full_name">[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name").eq("role", "admin").order("full_name");
  return (data ?? []) as Pick<Profile, "id" | "full_name">[];
}

export async function getAdminOverviewBundle(): Promise<AdminOverviewBundle> {
  const supabase = await createClient();

  const [
    { count: newLeadsCount },
    { count: clientsCount },
    { data: allLeads },
    { data: recentLeads },
    blogPosts,
    caseStudies,
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("client_profiles").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
    fetchAllCmsBlogPosts(true),
    fetchAllCmsCaseStudies(true),
  ]);

  const leads = (allLeads ?? []) as Lead[];
  const overdueLeads = leads
    .filter(isLeadOverdue)
    .sort((a, b) => {
      const aDue = a.follow_up_due_at ?? a.created_at;
      const bDue = b.follow_up_due_at ?? b.created_at;
      return aDue < bDue ? -1 : 1;
    })
    .slice(0, 8);

  const pipelineByStatus = emptyPipelineCounts();
  const triageByPriority: Record<string, number> = {};
  const triageByRisk: Record<string, number> = {};

  let awaitingFirstResponse = 0;
  let openPipeline = 0;

  for (const lead of leads) {
    pipelineByStatus[lead.status] += 1;
    if (lead.status !== "closed") openPipeline += 1;
    if (isLeadAwaitingFirstResponse(lead)) awaitingFirstResponse += 1;

    const priority = lead.triage_priority ?? "routine";
    triageByPriority[priority] = (triageByPriority[priority] ?? 0) + 1;

    const risk = lead.risk_flag ?? "standard";
    triageByRisk[risk] = (triageByRisk[risk] ?? 0) + 1;
  }

  const { cmsWorkflowCounts, cmsAttention } = buildCmsAttention(blogPosts, caseStudies);

  return {
    counts: {
      newLeads: newLeadsCount ?? 0,
      enrolledClients: clientsCount ?? 0,
      overdueLeads: leads.filter(isLeadOverdue).length,
      awaitingFirstResponse,
      openPipeline,
    },
    pipelineByStatus,
    triageByPriority,
    triageByRisk,
    overdueLeads,
    recentLeads: (recentLeads ?? []) as Lead[],
    cmsWorkflowCounts,
    cmsAttention,
  };
}

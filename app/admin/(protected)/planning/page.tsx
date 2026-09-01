import type { Metadata } from "next";
import { PlanningWorkspace } from "@/components/dashboard/meetings/PlanningWorkspace";
import { getPlanningWorkspaceData } from "@/lib/meetings/planningPageData";
import { createMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ tab?: string; owner?: string }>;
};

export const metadata: Metadata = createMetadata({
  title: "Team planning | Admin",
  description: "Internal planning action items — do now, later, and completed history.",
  path: "/admin/planning/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AdminPlanningPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getPlanningWorkspaceData(params);

  return (
    <PlanningWorkspace
      tab={data.tab}
      owner={data.owner}
      actions={data.actions}
      meetings={data.meetings}
      counts={data.counts}
    />
  );
}

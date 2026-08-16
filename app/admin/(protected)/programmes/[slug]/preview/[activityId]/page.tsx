import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgrammePreviewWizard } from "@/components/programme/ProgrammePreviewWizard";
import { getInteractiveProgramme } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; activityId: string }>;
};

function asDefinition(value: unknown): InteractiveProgrammeDefinition | null {
  if (!value || typeof value !== "object") return null;
  if (!("slug" in value) || !("activities" in value)) return null;
  return value as InteractiveProgrammeDefinition;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, activityId } = await params;
  return createMetadata({
    title: `Preview ${activityId} | ${slug} | Admin`,
    description: "Preview programme activity as a client without writing progress.",
    path: `/admin/programmes/${slug}/preview/${activityId}/`,
    noIndex: true,
  });
}

export default async function AdminProgrammePreviewPage({ params }: PageProps) {
  const { slug, activityId } = await params;
  const source = getInteractiveProgramme(slug);

  const supabase = await createClient();
  const { data: template } = await supabase
    .from("programme_templates")
    .select("draft_content_json, content_json")
    .eq("addiction_slug", slug)
    .maybeSingle();

  const definition =
    asDefinition(template?.draft_content_json) ?? asDefinition(template?.content_json) ?? source;
  if (!definition) notFound();
  const activity = definition.activities.find((item) => item.id === activityId);
  if (!activity) notFound();

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Client preview</p>
        <h1>{activity.title}</h1>
        <p>
          <Link href={`/admin/programmes/${slug}/?tab=activities`}>Back to editor</Link>
          {" · "}
          {activity.origin === "source" ? "Source content" : "Additional interactive exercise"}
        </p>
      </section>
      <ProgrammePreviewWizard definition={definition} activity={activity} />
    </div>
  );
}

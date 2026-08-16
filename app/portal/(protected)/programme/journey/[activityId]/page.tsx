import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ActivityWizard } from "@/components/programme/ActivityWizard";
import { getInteractiveProgramme } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { findActivity, resolveProgrammeDefinition } from "@/lib/programme/interactive/content";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";
import type { ClientActivityProgress } from "@/types/database";
import { recordProgrammeEvent } from "@/lib/programme/interactive/events";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ completed?: string; saved?: string; error?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { activityId } = await params;
  return createMetadata({
    title: "Programme activity | Client Portal",
    description: "Complete your interactive programme activity.",
    path: `/portal/programme/journey/${activityId}/`,
    noIndex: true,
  });
}

function asDefinition(value: unknown): InteractiveProgrammeDefinition | null {
  if (!value || typeof value !== "object") return null;
  if (!("slug" in value) || !("activities" in value)) return null;
  return value as InteractiveProgrammeDefinition;
}

export default async function PortalProgrammeActivityPage({ params, searchParams }: PageProps) {
  const { activityId } = await params;
  const { completed, saved, error } = await searchParams;
  const profile = await getAuthProfile();
  if (!profile) redirect("/portal/login/");

  const bundle = await getClientEnrollmentBundle(profile.id);
  if (!bundle?.enrollment) redirect("/portal/programme/");

  const definition =
    resolveProgrammeDefinition("", asDefinition(bundle.enrollment.content_snapshot)) ??
    asDefinition(bundle.template?.content_json) ??
    (bundle.template ? getInteractiveProgramme(bundle.template.addiction_slug) : null);

  if (!definition) {
    return (
      <div className="dashboard-stack">
        <section className="dashboard-page-header">
          <p className="eyebrow">Programme journey</p>
          <h1>Interactive content unavailable</h1>
        </section>
        <section className="dashboard-panel">
          <p className="dashboard-empty">
            This programme has not been published with interactive content yet. Please message Gerald for help.
          </p>
          <Link href="/portal/programme/">Back to programme</Link>
        </section>
      </div>
    );
  }

  const activity = findActivity(definition, activityId);
  if (!activity) notFound();

  const supabase = await createClient();
  const { data: progressRows } = await supabase
    .from("client_activity_progress")
    .select("*")
    .eq("enrollment_id", bundle.enrollment.id);

  const progress = ((progressRows as ClientActivityProgress[]) ?? []).find((row) => row.activity_id === activityId);
  if (!progress || progress.status === "locked") {
    redirect("/portal/programme/?error=locked");
  }

  const eventNow = new Date();
  await recordProgrammeEvent({
    supabase,
    enrollmentId: bundle.enrollment.id,
    clientProfileId: bundle.clientProfile.id,
    programmeSlug: definition.slug,
    programmeVersion: definition.version,
    moduleId: activity.moduleId,
    activityId: activity.id,
    eventType: progress.started_at ? "viewed" : "started",
    actorRole: "client",
    actorId: profile.id,
    idempotencyKey: progress.started_at
      ? `${bundle.enrollment.id}:${activity.id}:viewed:${eventNow.toISOString().slice(0, 10)}`
      : `${bundle.enrollment.id}:${activity.id}:started`,
  });

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">{definition.title}</p>
        <h1>{activity.title}</h1>
        <p>
          <Link href="/portal/programme/">Back to programme overview</Link>
        </p>
      </section>

      {completed ? (
        <p className="dashboard-inline-note dashboard-success-note">
          Step complete — this is your next journey activity. Continue when you are ready.
        </p>
      ) : null}
      {saved ? (
        <p className="dashboard-inline-note dashboard-success-note">
          Progress saved — you can leave and continue later.
        </p>
      ) : null}
      {error ? <p className="dashboard-inline-note dashboard-error-note">{decodeURIComponent(error)}</p> : null}

      <ActivityWizard
        enrollmentId={bundle.enrollment.id}
        activity={activity}
        programmeSlug={definition.slug}
        programmeVersion={definition.version}
        initialResponses={progress.responses ?? {}}
        status={progress.status}
        safetyDisclaimer={definition.safety.disclaimer}
        escalation={definition.safety.escalation}
      />
    </div>
  );
}

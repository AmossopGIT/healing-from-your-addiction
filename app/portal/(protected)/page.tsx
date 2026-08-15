import type { Metadata } from "next";
import Link from "next/link";
import { PortalActivityFeed } from "@/components/portal/PortalActivityFeed";
import { PortalDailyRitual } from "@/components/portal/PortalDailyRitual";
import { PortalGentleReminderPrompt } from "@/components/portal/PortalGentleReminderPrompt";
import { PortalHomeHero } from "@/components/portal/PortalHomeHero";
import { PortalNextStepCard } from "@/components/portal/PortalNextStepCard";
import { PortalPreCourseChecklist } from "@/components/portal/PortalPreCourseChecklist";
import { PortalProgressPanel } from "@/components/portal/PortalProgressPanel";
import { PortalQuickActions } from "@/components/portal/PortalQuickActions";
import { PortalThisWeekCard } from "@/components/portal/PortalThisWeekCard";
import { PortalWeeklyPulse } from "@/components/portal/PortalWeeklyPulse";
import { standardDisclaimer } from "@/lib/constants";
import { getPortalHomeBundle } from "@/lib/dashboard/queries";
import { withBasePath } from "@/lib/basePath";
import { getAuthProfile } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Client Portal | Healing From Your Addiction",
  description: "Private client portal.",
  path: "/portal/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ onboarded?: string; checkin?: string; goal?: string; homework?: string }>;
};

const checkInMessages: Record<string, string> = {
  saved: "Today's check-in has been saved.",
  invalid: "Please choose a mood and craving level between 0 and 5.",
  "note-too-long": "Please shorten your check-in note.",
  failed: "Unable to save your check-in right now.",
};

const homeworkMessages: Record<string, string> = {
  saved: "Practice tick saved.",
  invalid: "That practice task could not be updated.",
  "note-too-long": "Please shorten your practice note.",
  failed: "Unable to save your practice tick right now.",
};

export default async function PortalHomePage({ searchParams }: PageProps) {
  const { onboarded, checkin, homework } = await searchParams;
  const profile = await getAuthProfile();
  const bundle = profile ? await getPortalHomeBundle(profile.id) : null;

  if (!bundle) {
    return (
      <div className="dashboard-stack">
        <p className="dashboard-empty">Your portal is loading. If this persists, sign in again.</p>
      </div>
    );
  }

  const showCheckIn = bundle.stage !== "onboarding";
  const showProgress = bundle.stage !== "onboarding";
  const showQuickActions = bundle.stage === "pre_intake" || bundle.stage === "pre_programme" || bundle.stage === "active_programme";
  const showNextStep = bundle.stage !== "maintenance";
  const pushPublicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  const subscribeUrl = withBasePath("/api/push/subscribe/");
  const serviceWorkerUrl = withBasePath("/sw.js");

  return (
    <div className="dashboard-stack portal-home-stack">
      {onboarded ? (
        <p className="dashboard-inline-note dashboard-success-note">
          Your profile is complete. <Link href="/portal/account/">View your profile</Link>
        </p>
      ) : null}
      {checkin && checkInMessages[checkin] ? (
        <p className={`dashboard-inline-note${checkin === "saved" ? " dashboard-success-note" : ""}`}>
          {checkInMessages[checkin]}
        </p>
      ) : null}
      {homework && homeworkMessages[homework] ? (
        <p className={`dashboard-inline-note${homework === "saved" ? " dashboard-success-note" : ""}`}>
          {homeworkMessages[homework]}
        </p>
      ) : null}

      {bundle.sections.includes("hero") ? <PortalHomeHero hero={bundle.hero} /> : null}
      {bundle.sections.includes("this_week") && bundle.thisWeek ? (
        <PortalThisWeekCard thisWeek={bundle.thisWeek} />
      ) : showNextStep && bundle.sections.includes("next_step") ? (
        <PortalNextStepCard nextStep={bundle.nextStep} />
      ) : null}
      {bundle.sections.includes("pre_course") && bundle.preCourseChecklist.length > 0 ? (
        <PortalPreCourseChecklist items={bundle.preCourseChecklist} />
      ) : null}
      {showQuickActions && bundle.sections.includes("quick_actions") ? (
        <PortalQuickActions
          nextSessionHref={bundle.nextSessionHref}
          nextSessionLabel={bundle.nextSessionLabel}
          journeyHref={bundle.thisWeek?.journeyHref ?? null}
          journeyLabel={bundle.thisWeek?.journeyTitle ?? null}
          focusKind={bundle.thisWeek?.focusKind ?? null}
        />
      ) : null}
      {bundle.sections.includes("daily_ritual") ? (
        <PortalDailyRitual
          dailyAffirmation={bundle.dailyAffirmation}
          affirmationNote={bundle.affirmationNote}
          todayCheckIn={bundle.todayCheckIn}
          showCheckIn={showCheckIn}
          homeworkTasks={bundle.homeworkTasks}
          todayHomeworkEntries={bundle.todayHomeworkEntries}
          homeworkTone={bundle.homeworkTone}
          pointsTotal={bundle.pointsTotal}
        />
      ) : null}
      {showProgress && bundle.sections.includes("progress") ? (
        <PortalProgressPanel
          completedSessionCount={bundle.completedSessionCount}
          availableSessionCount={bundle.availableSessionCount}
          engagementStreak={bundle.engagementStreak}
          pauseCountThisWeek={bundle.pauseCountThisWeek}
          abstinenceDays={bundle.abstinenceDays}
          showAbstinence={Boolean(bundle.recoveryGoal?.show_abstinence_counter)}
          pointsTotal={bundle.pointsTotal}
          milestones={bundle.milestones}
        />
      ) : null}
      {bundle.sections.includes("weekly_pulse") ? (
        <PortalWeeklyPulse
          recentCheckIns={bundle.recentCheckIns}
          pauseCountThisWeek={bundle.pauseCountThisWeek}
          engagementStreak={bundle.engagementStreak}
        />
      ) : null}
      {bundle.sections.includes("activity_feed") ? <PortalActivityFeed items={bundle.activityFeed} /> : null}
      {bundle.sections.includes("gentle_reminder") ? (
        <PortalGentleReminderPrompt
          hasPushReminders={bundle.hasPushReminders}
          pushPublicKey={pushPublicKey}
          subscribeUrl={subscribeUrl}
          serviceWorkerUrl={serviceWorkerUrl}
        />
      ) : null}

      <section className="dashboard-panel dashboard-disclaimer">
        <p>{standardDisclaimer}</p>
      </section>
    </div>
  );
}

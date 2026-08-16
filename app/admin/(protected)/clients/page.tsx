import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { consultationStatusLabels, isConsultationCompleteStatus } from "@/lib/consultation/schema";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { getClientConsultations, getClientIntakeSubmissions } from "@/lib/dashboard/queries";
import { countAnsweredQuestions, getIntakeQuestionSetForAddiction } from "@/lib/intake/questions";
import { buildClientJourneySnapshot } from "@/lib/portal/courseLoop";
import { createMetadata } from "@/lib/seo";
import type { Enrollment } from "@/types/database";

export const metadata: Metadata = createMetadata({
  title: "Clients | Admin",
  description: "Enrolled clients.",
  path: "/admin/clients/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const [{ data: clients }, intakeSubmissions, consultations] = await Promise.all([
    supabase.from("client_profiles").select("*").order("created_at", { ascending: false }),
    getClientIntakeSubmissions(),
    getClientConsultations(),
  ]);

  const clientIds = (clients ?? []).map((client) => client.id);
  const [{ data: enrollments }, { data: openFlags }] = await Promise.all([
    clientIds.length
      ? supabase
          .from("enrollments")
          .select("id, client_profile_id, status, created_at, last_activity_at, current_activity_id")
          .in("client_profile_id", clientIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({
          data: [] as {
            id: string;
            client_profile_id: string;
            status: string;
            created_at: string;
            last_activity_at: string | null;
            current_activity_id: string | null;
          }[],
        }),
    clientIds.length
      ? supabase
          .from("programme_admin_flags")
          .select("id, client_profile_id, severity, flag_type, resolved_at")
          .in("client_profile_id", clientIds)
          .is("resolved_at", null)
      : Promise.resolve({
          data: [] as {
            id: string;
            client_profile_id: string;
            severity: string;
            flag_type: string;
            resolved_at: string | null;
          }[],
        }),
  ]);

  const enrollmentIds = [...new Set((enrollments ?? []).map((row) => row.id))];
  const { data: schedules } = enrollmentIds.length
    ? await supabase.from("enrollment_schedules").select("enrollment_id").in("enrollment_id", enrollmentIds)
    : { data: [] as { enrollment_id: string }[] };

  const intakeByClientId = new Map(intakeSubmissions.map((submission) => [submission.client_profile_id, submission]));
  const consultationByClientId = new Map(consultations.map((item) => [item.client_profile_id, item]));
  const enrollmentByClientId = new Map<
    string,
    {
      id: string;
      status: string;
      last_activity_at: string | null;
      current_activity_id: string | null;
    }
  >();
  for (const row of enrollments ?? []) {
    if (!enrollmentByClientId.has(row.client_profile_id)) {
      enrollmentByClientId.set(row.client_profile_id, {
        id: row.id,
        status: row.status,
        last_activity_at: row.last_activity_at,
        current_activity_id: row.current_activity_id,
      });
    }
  }
  const scheduleByEnrollmentId = new Set((schedules ?? []).map((row) => row.enrollment_id));
  const openFlagCountByClient = new Map<string, number>();
  const urgentFlagByClient = new Set<string>();
  for (const flag of openFlags ?? []) {
    openFlagCountByClient.set(flag.client_profile_id, (openFlagCountByClient.get(flag.client_profile_id) ?? 0) + 1);
    if (flag.severity === "urgent" || flag.flag_type === "safety") {
      urgentFlagByClient.add(flag.client_profile_id);
    }
  }

  const userIds = [...new Set((clients ?? []).map((client) => client.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, phone").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; phone: string | null }[] };
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Clients</p>
        <h1>Enrolled clients</h1>
        <p>
          <Link href="/admin/clients/invite/" className="button button-primary button-small">
            Invite client
          </Link>
        </p>
      </section>
      <section className="dashboard-panel">
        {clients?.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Journey</th>
                  <th>Addiction</th>
                  <th>Intake</th>
                  <th>Consultation</th>
                  <th>Week 1</th>
                  <th>Flags</th>
                  <th>Contact</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const profile = profileMap.get(client.user_id);
                  const intake = intakeByClientId.get(client.id);
                  const consultation = consultationByClientId.get(client.id);
                  const enrollment = enrollmentByClientId.get(client.id);
                  const hasSchedule = enrollment ? scheduleByEnrollmentId.has(enrollment.id) : false;
                  const openFlagCount = openFlagCountByClient.get(client.id) ?? 0;
                  const hasUrgent = urgentFlagByClient.has(client.id);

                  const questionSet = client.addiction_slug
                    ? getIntakeQuestionSetForAddiction(client.addiction_slug)
                    : null;
                  const intakeProgress =
                    intake && questionSet
                      ? countAnsweredQuestions(intake.responses ?? {}, questionSet)
                      : { answered: 0, total: questionSet?.sections.flatMap((section) => section.questions).length ?? 0 };

                  const snapshot = buildClientJourneySnapshot({
                    clientProfile: client,
                    passwordSet: null,
                    intakeAnswered: intakeProgress.answered,
                    intakeTotal: intakeProgress.total,
                    intakeComplete: Boolean(intake?.completed_at),
                    enrollment: enrollment
                      ? {
                          status: enrollment.status as Enrollment["status"],
                          last_activity_at: enrollment.last_activity_at,
                        }
                      : null,
                    weekNumber: enrollment ? 1 : null,
                    nextStepSentence: enrollment
                      ? hasSchedule
                        ? "Programme active — check This week on their portal."
                        : "Needs schedule slot."
                      : intake?.completed_at
                        ? "Ready to assign programme."
                        : "Waiting on intake / onboarding.",
                    lastActivityAt: enrollment?.last_activity_at ?? null,
                    openFlagCount,
                  });

                  let week1Label = "Not assigned";
                  let week1Class = "status-badge status-badge-intake-not-started";
                  if (enrollment && hasSchedule) {
                    week1Label = "Slot set";
                    week1Class = "status-badge status-badge-intake-complete";
                  } else if (enrollment) {
                    week1Label = "Needs slot";
                    week1Class = "status-badge status-badge-intake-in-progress";
                  }

                  return (
                    <tr key={client.id}>
                      <td>
                        <Link href={`/admin/clients/${client.id}/`}>{profile?.full_name ?? "Client"}</Link>
                      </td>
                      <td>
                        <span className="status-badge status-badge-intake-in-progress">{snapshot.stageLabel}</span>
                        <p className="dashboard-table-hint">{snapshot.nextStepSentence}</p>
                        <p className="dashboard-table-hint">
                          {snapshot.inviteSent ? "Invite sent" : "Invite not sent"}
                          {" · "}
                          {snapshot.onboarded ? "Onboarded" : "Not onboarded"}
                          {" · "}
                          Last:{" "}
                          {snapshot.lastActivityAt ? formatDashboardDate(snapshot.lastActivityAt) : "—"}
                        </p>
                      </td>
                      <td>{client.addiction_slug ?? "—"}</td>
                      <td>
                        {intake?.completed_at ? (
                          <span className="status-badge status-badge-intake-complete">
                            Completed ({intakeProgress.answered}/{intakeProgress.total})
                          </span>
                        ) : intake ? (
                          <Link href={`/admin/clients/${client.id}/intake/`} className="status-badge status-badge-intake-in-progress">
                            {intakeProgress.answered}/{intakeProgress.total}
                          </Link>
                        ) : (
                          <span className="status-badge status-badge-intake-not-started">Not started</span>
                        )}
                      </td>
                      <td>
                        {consultation ? (
                          <Link
                            href={`/admin/clients/${client.id}/consultation/`}
                            className={`status-badge status-badge-consultation-${consultation.status}`}
                          >
                            {consultationStatusLabels[consultation.status]}
                            {!isConsultationCompleteStatus(consultation.status) && consultation.percent_complete > 0
                              ? ` ${consultation.percent_complete}%`
                              : ""}
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/clients/${client.id}/consultation/`}
                            className="status-badge status-badge-consultation-not_sent"
                          >
                            Not sent
                          </Link>
                        )}
                      </td>
                      <td>
                        <Link href={`/admin/clients/${client.id}/programme/`} className={week1Class}>
                          {week1Label}
                        </Link>
                      </td>
                      <td>
                        {openFlagCount ? (
                          <Link
                            href={`/admin/clients/${client.id}/programme/#flags`}
                            className={`status-badge${hasUrgent ? " status-badge-consultation-not_sent" : " status-badge-intake-in-progress"}`}
                          >
                            {hasUrgent ? "Urgent" : `${openFlagCount} open`}
                          </Link>
                        ) : (
                          <span className="dashboard-inline-note">—</span>
                        )}
                      </td>
                      <td>{profile?.phone ?? client.preferred_contact_method ?? "—"}</td>
                      <td>{formatDashboardDate(client.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No clients yet. Invite a client from a qualified lead.</p>
        )}
      </section>
    </div>
  );
}

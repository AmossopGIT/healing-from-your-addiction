import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import {
  getActivityDropOffReport,
  getProgrammeReportingSummary,
} from "@/lib/programme/interactive/reporting";

export const metadata: Metadata = createMetadata({
  title: "Programme operations | Admin",
  description: "Cross-client programme operations and engagement.",
  path: "/admin/programmes/operations/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    programme?: string;
    from?: string;
    to?: string;
    inactiveOnly?: string;
  }>;
};

export default async function AdminProgrammeOperationsPage({ searchParams }: PageProps) {
  const { programme, from, to, inactiveOnly } = await searchParams;
  const filters = { programmeSlug: programme || null, from: from || null, to: to || null };
  const supabase = await createClient();

  const [{ data: enrollments }, { data: flags }, { data: activityRows }, funnel, dropOff, { data: templates }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select(
          "id, client_profile_id, status, current_activity_id, last_activity_at, journey_completed_at, template_id, created_at",
        )
        .order("last_activity_at", { ascending: false, nullsFirst: false })
        .limit(100),
      supabase
        .from("programme_admin_flags")
        .select("id, enrollment_id, client_profile_id, flag_type, severity, note, created_at, resolved_at")
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("client_activity_progress")
        .select("enrollment_id, status, completed_at, updated_at")
        .in("status", ["available", "in_progress", "completed"])
        .limit(1000),
      getProgrammeReportingSummary(filters),
      getActivityDropOffReport(filters),
      supabase.from("programme_templates").select("id, title, addiction_slug").order("addiction_slug"),
    ]);

  const clientIds = [...new Set((enrollments ?? []).map((row) => row.client_profile_id))];
  const templateIds = [...new Set((enrollments ?? []).map((row) => row.template_id))];

  const [{ data: clients }, { data: enrollmentTemplates }, { data: profiles }] = await Promise.all([
    clientIds.length
      ? supabase.from("client_profiles").select("id, user_id, addiction_slug").in("id", clientIds)
      : Promise.resolve({ data: [] as Array<{ id: string; user_id: string; addiction_slug: string | null }> }),
    templateIds.length
      ? supabase.from("programme_templates").select("id, title, addiction_slug").in("id", templateIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; addiction_slug: string }> }),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const clientById = new Map((clients ?? []).map((client) => [client.id, client]));
  const templateById = new Map((enrollmentTemplates ?? []).map((template) => [template.id, template]));
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  const completedByEnrollment = new Map<string, number>();
  const openByEnrollment = new Map<string, number>();
  for (const row of activityRows ?? []) {
    if (row.status === "completed") {
      completedByEnrollment.set(row.enrollment_id, (completedByEnrollment.get(row.enrollment_id) ?? 0) + 1);
    } else {
      openByEnrollment.set(row.enrollment_id, (openByEnrollment.get(row.enrollment_id) ?? 0) + 1);
    }
  }

  const now = Date.now();
  let enrollmentRows = enrollments ?? [];
  if (programme) {
    const matchingTemplateIds = new Set(
      (templates ?? []).filter((item) => item.addiction_slug === programme).map((item) => item.id),
    );
    enrollmentRows = enrollmentRows.filter((row) => matchingTemplateIds.has(row.template_id));
  }
  if (inactiveOnly === "1") {
    enrollmentRows = enrollmentRows.filter((enrollment) => {
      if (enrollment.status !== "active") return false;
      if (!enrollment.last_activity_at) return true;
      return (now - new Date(enrollment.last_activity_at).getTime()) / (1000 * 60 * 60 * 24) >= 5;
    });
  }

  const inactive = (enrollments ?? []).filter((enrollment) => {
    if (enrollment.status !== "active") return false;
    if (!enrollment.last_activity_at) return true;
    const ageDays = (now - new Date(enrollment.last_activity_at).getTime()) / (1000 * 60 * 60 * 24);
    return ageDays >= 5;
  });

  const exportHref = `/api/admin/programmes/export/?${new URLSearchParams({
    ...(programme ? { programme } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString()}`;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Operations</p>
        <h1>Programme operations</h1>
        <p>
          <Link href="/admin/programmes/">Back to programme library</Link>
          {" · "}
          <a href={exportHref}>Export CSV</a>
        </p>
      </section>

      <section className="dashboard-panel">
        <h2>Filters</h2>
        <form className="dashboard-form" method="get">
          <label className="form-field">
            <span>Programme</span>
            <select name="programme" defaultValue={programme ?? ""}>
              <option value="">All programmes</option>
              {(templates ?? []).map((item) => (
                <option key={item.id} value={item.addiction_slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>From</span>
            <input type="date" name="from" defaultValue={from ?? ""} />
          </label>
          <label className="form-field">
            <span>To</span>
            <input type="date" name="to" defaultValue={to ?? ""} />
          </label>
          <label className="form-field portal-home-checkbox-field">
            <input type="checkbox" name="inactiveOnly" value="1" defaultChecked={inactiveOnly === "1"} />
            <span>Inactive clients only</span>
          </label>
          <button type="submit" className="button button-secondary button-small">
            Apply filters
          </button>
        </form>
      </section>

      <section className="admin-programme-summary">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Active enrollments</p>
          <p className="admin-programme-stat-value">
            {(enrollments ?? []).filter((item) => item.status === "active").length}
          </p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Inactive 5+ days</p>
          <p className="admin-programme-stat-value">{inactive.length}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Open flags</p>
          <p className="admin-programme-stat-value">{(flags ?? []).length}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Safety events</p>
          <p className="admin-programme-stat-value">{funnel.reduce((sum, row) => sum + row.safetyFlags, 0)}</p>
        </article>
      </section>

      <section className="dashboard-panel">
        <h2>Funnel by programme</h2>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Enrolled</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Avg days to start</th>
                <th>Safety flags</th>
                <th>Inactive</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((row) => (
                <tr key={row.addictionSlug}>
                  <td>{row.title}</td>
                  <td>{row.enrollments}</td>
                  <td>{row.started}</td>
                  <td>{row.completed}</td>
                  <td>{row.avgDaysToStart ?? "—"}</td>
                  <td>{row.safetyFlags}</td>
                  <td>{row.inactiveActiveClients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Activity drop-off</h2>
        {dropOff.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Activity</th>
                  <th>Started/viewed</th>
                  <th>Completed</th>
                  <th>Drop-off %</th>
                </tr>
              </thead>
              <tbody>
                {dropOff.map((row) => (
                  <tr key={`${row.programmeSlug}:${row.activityId}`}>
                    <td>{row.programmeSlug}</td>
                    <td>{row.activityId}</td>
                    <td>{row.started}</td>
                    <td>{row.completed}</td>
                    <td>{row.dropOffRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No durable activity events yet for these filters.</p>
        )}
      </section>

      <section className="dashboard-panel">
        <h2>Open flags</h2>
        {(flags ?? []).length ? (
          <ul className="dashboard-session-list">
            {(flags ?? []).map((flag) => {
              const client = clientById.get(flag.client_profile_id);
              const profile = client ? profileById.get(client.user_id) : null;
              return (
                <li key={flag.id} className="dashboard-session-item">
                  <div>
                    <strong>
                      {profile?.full_name ?? "Client"} · {flag.flag_type} · {flag.severity}
                    </strong>
                    <p>{flag.note}</p>
                    <p className="dashboard-inline-note">{formatDashboardDate(flag.created_at)}</p>
                    <p>
                      <Link href={`/admin/clients/${flag.client_profile_id}/programme/`}>Open client programme</Link>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="dashboard-empty">No open flags.</p>
        )}
      </section>

      <section className="dashboard-panel">
        <h2>Recent enrollments</h2>
        <ul className="dashboard-session-list">
          {enrollmentRows.map((enrollment) => {
            const client = clientById.get(enrollment.client_profile_id);
            const profile = client ? profileById.get(client.user_id) : null;
            const template = templateById.get(enrollment.template_id);
            return (
              <li key={enrollment.id} className="dashboard-session-item">
                <div>
                  <strong>
                    {profile?.full_name ?? "Client"} · {template?.title ?? "Programme"}
                  </strong>
                  <p className="dashboard-inline-note">
                    {enrollment.status} · completed activities {completedByEnrollment.get(enrollment.id) ?? 0} · open{" "}
                    {openByEnrollment.get(enrollment.id) ?? 0}
                    {enrollment.last_activity_at ? ` · last ${formatDashboardDate(enrollment.last_activity_at)}` : ""}
                  </p>
                  <p>
                    <Link href={`/admin/clients/${enrollment.client_profile_id}/programme/`}>Open</Link>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

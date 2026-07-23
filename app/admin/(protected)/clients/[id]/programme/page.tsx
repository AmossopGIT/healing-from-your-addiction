import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createEnrollment, unlockSessionProgress } from "@/lib/dashboard/programmeActions";
import { getAdminClientBundle } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client programme | Admin",
    description: "Manage client programme.",
    path: `/admin/clients/${id}/programme/`,
    noIndex: true,
  });
}

export default async function AdminClientProgrammePage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const { enrollment, template, templates, sessions, progress } = bundle;
  const progressBySession = new Map(progress.map((item) => [item.session_id, item]));

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme</p>
        <h1>{template?.title ?? "Assign programme"}</h1>
        <p>
          <Link href={`/admin/clients/${id}/`}>Back to client</Link>
        </p>
      </section>
      {!enrollment ? (
        <section className="dashboard-panel">
          <h2>Assign programme</h2>
          <form action={createEnrollment} className="dashboard-form">
            <input type="hidden" name="clientProfileId" value={id} />
            <label className="form-field">
              <span>Template</span>
              <select name="templateId" required>
                <option value="">Select template</option>
                {templates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.addiction_slug})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Start date</span>
              <input type="date" name="startDate" />
            </label>
            <button type="submit" className="button button-primary">
              Create enrollment
            </button>
          </form>
        </section>
      ) : (
        <section className="dashboard-panel">
          <h2>Sessions</h2>
          <ul className="dashboard-session-list">
            {sessions.map((session) => {
              const item = progressBySession.get(session.id);
              return (
                <li key={session.id} className="dashboard-session-item">
                  <div>
                    <strong>{session.title}</strong>
                    <p>
                      Week {session.week_number} · {session.content_type} · {item?.status ?? "locked"}
                    </p>
                  </div>
                  {item?.status === "locked" ? (
                    <form action={unlockSessionProgress}>
                      <input type="hidden" name="progressId" value={item.id} />
                      <input type="hidden" name="clientProfileId" value={id} />
                      <button type="submit" className="button button-small button-secondary">
                        Unlock
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

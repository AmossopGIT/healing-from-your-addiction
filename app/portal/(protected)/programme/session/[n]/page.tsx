import type { Metadata } from "next";
import Link from "next/link";
import { SessionContent } from "@/components/dashboard/SessionContent";
import { markSessionProgress } from "@/lib/dashboard/programmeActions";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  return createMetadata({
    title: `Session ${n} | Client Portal`,
    description: "Programme session.",
    path: `/portal/programme/session/${n}/`,
    noIndex: true,
  });
}

export default async function PortalSessionPage({ params }: PageProps) {
  const { n } = await params;
  const sessionNumber = Number(n);
  const profile = await getAuthProfile();
  const bundle = profile ? await getClientEnrollmentBundle(profile.id) : null;
  const session = bundle?.sessions.find((item) => item.session_number === sessionNumber);
  const progress = session ? bundle?.progress.find((item) => item.session_id === session.id) : null;

  if (!session || !progress || progress.status === "locked") {
    return (
      <div className="dashboard-stack">
        <p className="dashboard-empty">This session is not available yet.</p>
        <Link href="/portal/programme/" className="button button-secondary">Back to programme</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Session {session.session_number}</p>
        <h1>{session.title}</h1>
      </section>
      <section className="dashboard-panel">
        <SessionContent contentRef={session.content_ref} contentType={session.content_type} />
      </section>
      <section className="dashboard-panel">
        <form action={markSessionProgress} className="dashboard-form">
          <input type="hidden" name="progressId" value={progress.id} />
          <input type="hidden" name="status" value="completed" />
          <input type="hidden" name="redirectTo" value={`/portal/programme/session/${session.session_number}/`} />
          <label className="form-field">
            <span>Your notes (optional)</span>
            <textarea name="clientNotes" rows={3} defaultValue={progress.client_notes ?? ""} />
          </label>
          <button type="submit" className="button button-primary">
            {progress.status === "completed" ? "Update notes" : "Mark as completed"}
          </button>
        </form>
      </section>
    </div>
  );
}

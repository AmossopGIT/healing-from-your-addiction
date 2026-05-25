import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addLeadNote, updateLeadStatusForm } from "@/lib/dashboard/adminActions";
import { formatDashboardDate, leadStatusLabels, leadStatusOptions } from "@/lib/dashboard/constants";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({ title: `Lead | Admin`, description: "Lead detail.", path: `/admin/leads/${id}/`, noIndex: true });
}

export default async function AdminLeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();

  const { data: notesRaw } = await supabase
    .from("lead_notes")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const authorIds = [...new Set((notesRaw ?? []).map((note) => note.author_id))];
  const { data: authors } = authorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", authorIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const authorMap = new Map((authors ?? []).map((author) => [author.id, author]));
  const notes = (notesRaw ?? []).map((note) => ({
    ...note,
    profiles: authorMap.get(note.author_id) ?? null,
  }));

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Lead detail</p>
        <h1>{lead.full_name}</h1>
        <p>Received {formatDashboardDate(lead.created_at)} · <span className={`status-badge status-badge-${lead.status}`}>{leadStatusLabels[lead.status]}</span></p>
      </section>
      <div className="dashboard-two-col">
        <section className="dashboard-panel">
          <h2>Contact details</h2>
          <dl className="dashboard-dl">
            <div><dt>Email</dt><dd>{lead.email}</dd></div>
            <div><dt>Phone</dt><dd>{lead.phone}</dd></div>
            <div><dt>Preferred contact</dt><dd>{lead.preferred_contact_method}</dd></div>
            <div><dt>Addiction concern</dt><dd>{lead.addiction_concern}</dd></div>
            {lead.message ? <div><dt>Message</dt><dd>{lead.message}</dd></div> : null}
          </dl>
        </section>
        <section className="dashboard-panel">
          <h2>Attribution</h2>
          <dl className="dashboard-dl">
            <div><dt>Source page</dt><dd>{lead.source_page ?? "—"}</dd></div>
            <div><dt>Landing page</dt><dd>{lead.landing_page ?? "—"}</dd></div>
            <div><dt>Primary keyword</dt><dd>{lead.primary_keyword ?? "—"}</dd></div>
            <div><dt>UTM campaign</dt><dd>{lead.utm_campaign ?? "—"}</dd></div>
          </dl>
        </section>
      </div>
      <section className="dashboard-panel">
        <h2>Update status</h2>
        <div className="dashboard-status-actions">
          {leadStatusOptions.map((status) => (
            <form key={status} action={updateLeadStatusForm}>
              <input type="hidden" name="leadId" value={lead.id} />
              <input type="hidden" name="status" value={status} />
              <button type="submit" className={`button button-small ${lead.status === status ? "button-primary" : "button-secondary"}`}>{leadStatusLabels[status]}</button>
            </form>
          ))}
        </div>
        {!lead.client_id ? <p className="dashboard-inline-note">Ready to enrol? <Link href={`/admin/clients/invite/?leadId=${lead.id}`}>Invite this client</Link>.</p> : null}
      </section>
      <section className="dashboard-panel">
        <h2>Internal notes</h2>
        <form action={addLeadNote} className="dashboard-note-form">
          <input type="hidden" name="leadId" value={lead.id} />
          <label className="form-field">
            <span>Add a private note</span>
            <textarea name="body" rows={4} maxLength={dashboardFieldMaxLengths.noteBody} required />
          </label>
          <button type="submit" className="button button-primary">Save note</button>
        </form>
        {notes?.length ? (
          <ul className="dashboard-note-list">
            {notes.map((note) => (
              <li key={note.id}>
                <p>{note.body}</p>
                <p className="dashboard-note-meta">{(note.profiles as { full_name?: string | null } | null)?.full_name ?? "Admin"} · {formatDashboardDate(note.created_at)}</p>
              </li>
            ))}
          </ul>
        ) : <p className="dashboard-empty">No notes yet.</p>}
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}


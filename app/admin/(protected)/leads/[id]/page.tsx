import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminFieldLabel } from "@/components/dashboard/AdminFieldLabel";
import { AdminHelpTooltip } from "@/components/dashboard/AdminHelpTooltip";
import { LeadSlaBadge } from "@/components/dashboard/LeadSlaBadge";
import { addLeadNote, updateLeadFollowUpForm, updateLeadQuickActionForm, updateLeadStatusForm } from "@/lib/dashboard/adminActions";
import { adminTooltips } from "@/lib/dashboard/adminTooltips";
import { fetchAdminProfiles } from "@/lib/dashboard/adminOverview";
import { formatDashboardDate, leadStatusLabels, leadStatusOptions } from "@/lib/dashboard/constants";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import {
  canInviteLead,
  formatLeadTriageLabel,
  getLeadNextStepCopy,
  getRecommendedNextStatus,
  leadStatusWorkflowLine,
} from "@/lib/dashboard/leadNextStep";
import { formatDatetimeLocalValue } from "@/lib/dashboard/leadSla";
import { firstResponseTemplates, resolveFirstResponseTemplate } from "@/lib/leads/firstResponseTemplates";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({ title: `Lead | Admin`, description: "Lead detail.", path: `/admin/leads/${id}/`, noIndex: true });
}

export default async function AdminLeadDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data: lead }, adminProfiles, profile] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    fetchAdminProfiles(),
    getAuthProfile(),
  ]);
  if (!lead) notFound();

  const assignedAdmin = lead.assigned_admin_id
    ? adminProfiles.find((adminProfile) => adminProfile.id === lead.assigned_admin_id)
    : null;

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
  const recommendedTemplate = resolveFirstResponseTemplate(lead);
  const templateIds = new Set(firstResponseTemplates.map((template) => template.id));
  const selectedTemplateId =
    lead.first_response_template_id && templateIds.has(lead.first_response_template_id)
      ? lead.first_response_template_id
      : "";
  const recommendedStatus = getRecommendedNextStatus(lead.status);
  const nextStepCopy = getLeadNextStepCopy(lead.status);
  const detailRedirect = `/admin/leads/${lead.id}/`;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Lead detail</p>
        <h1>{lead.full_name}</h1>
        <p>
          Received {formatDashboardDate(lead.created_at)} ·{" "}
          <span className={`status-badge status-badge-${lead.status}`}>{leadStatusLabels[lead.status]}</span> ·{" "}
          <LeadSlaBadge lead={lead} /> · {formatLeadTriageLabel(lead)}
        </p>
        <p className="dashboard-inline-note">
          Next: {nextStepCopy}{" "}
          <Link href="/admin/docs/lead-to-client-onboarding-flow/">Onboarding guide</Link>
        </p>
      </section>
      <div className="dashboard-two-col">
        <section className="dashboard-panel">
          <h2>Contact details</h2>
          <dl className="dashboard-dl">
            <div>
              <dt>Email</dt>
              <dd>{lead.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{lead.phone}</dd>
            </div>
            <div>
              <dt>Preferred contact</dt>
              <dd>{lead.preferred_contact_method}</dd>
            </div>
            <div>
              <dt>Addiction concern</dt>
              <dd>{lead.addiction_concern}</dd>
            </div>
            {lead.message ? (
              <div>
                <dt>Message</dt>
                <dd>{lead.message}</dd>
              </div>
            ) : null}
            {lead.support_goals ? (
              <div>
                <dt>Support goals</dt>
                <dd>{lead.support_goals}</dd>
              </div>
            ) : null}
          </dl>
        </section>
        <section className="dashboard-panel">
          <h2>Triage summary</h2>
          <dl className="dashboard-dl">
            <div>
              <dt>Triage priority</dt>
              <dd>{formatLeadTriageLabel(lead)}</dd>
            </div>
            <div>
              <dt>
                <AdminFieldLabel label="Risk flag" tooltip={adminTooltips.leadDetail.riskFlag} />
              </dt>
              <dd>{lead.risk_flag ?? "standard"}</dd>
            </div>
            <div>
              <dt>Target SLA</dt>
              <dd>{lead.triage_sla_hours ? `${lead.triage_sla_hours}h` : "24h"}</dd>
            </div>
            <div>
              <dt>Urgency level</dt>
              <dd>{lead.urgency_level ?? "—"}</dd>
            </div>
            <div>
              <dt>
                <AdminFieldLabel label="Withdrawal support level" tooltip={adminTooltips.leadDetail.withdrawalRisk} />
              </dt>
              <dd>{lead.withdrawal_risk ?? "—"}</dd>
            </div>
            <div>
              <dt>Medical support involved</dt>
              <dd>{lead.medical_support_involved ?? "—"}</dd>
            </div>
            <div>
              <dt>Best callback window</dt>
              <dd>{lead.callback_window ?? "—"}</dd>
            </div>
            <div>
              <dt>Readiness stage</dt>
              <dd>{lead.readiness_stage ?? "—"}</dd>
            </div>
            <div>
              <dt>
                <AdminFieldLabel label="Follow-up consent" tooltip={adminTooltips.leadDetail.followUpConsent} />
              </dt>
              <dd>
                WhatsApp: {lead.follow_up_consent_whatsapp ? "Yes" : "No"} · Email:{" "}
                {lead.follow_up_consent_email ? "Yes" : "No"} · Phone: {lead.follow_up_consent_phone ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <div className="dashboard-two-col">
        <section className="dashboard-panel">
          <h2>Attribution</h2>
          <dl className="dashboard-dl">
            <div>
              <dt>Source page</dt>
              <dd>{lead.source_page ?? "—"}</dd>
            </div>
            <div>
              <dt>Landing page</dt>
              <dd>{lead.landing_page ?? "—"}</dd>
            </div>
            <div>
              <dt>Primary keyword</dt>
              <dd>{lead.primary_keyword ?? "—"}</dd>
            </div>
            <div>
              <dt>UTM campaign</dt>
              <dd>{lead.utm_campaign ?? "—"}</dd>
            </div>
          </dl>
        </section>
        <section className="dashboard-panel">
          <h2>Follow-up operations</h2>
          <dl className="dashboard-dl">
            <div>
              <dt>
                <AdminFieldLabel label="Assigned admin" tooltip={adminTooltips.leads.assigned} />
              </dt>
              <dd>{assignedAdmin?.full_name ?? (lead.assigned_admin_id ? "Admin" : "Unassigned")}</dd>
            </div>
            {!lead.assigned_admin_id && profile?.id ? (
              <form action={updateLeadQuickActionForm} className="dashboard-note-form">
                <input type="hidden" name="leadId" value={lead.id} />
                <input type="hidden" name="redirectTo" value={detailRedirect} />
                <input type="hidden" name="assignToMe" value="1" />
                <button type="submit" className="button button-secondary" title={adminTooltips.leads.assignToMe}>
                  Assign to me
                </button>
              </form>
            ) : null}
            <div>
              <dt>Follow-up due</dt>
              <dd>{lead.follow_up_due_at ? formatDashboardDate(lead.follow_up_due_at) : "Not set"}</dd>
            </div>
            <div>
              <dt>First response template</dt>
              <dd>{lead.first_response_template_id ?? "Not selected"}</dd>
            </div>
            <div>
              <dt>First response sent</dt>
              <dd>{lead.first_response_sent_at ? formatDashboardDate(lead.first_response_sent_at) : "Not sent"}</dd>
            </div>
            <div>
              <dt>Assigned admin notes</dt>
              <dd>{lead.assigned_admin_notes ?? "—"}</dd>
            </div>
            <div>
              <dt>Recommended template</dt>
              <dd>{recommendedTemplate.label}</dd>
            </div>
          </dl>
          <p>{recommendedTemplate.buildMessage(lead)}</p>
          <form action={updateLeadFollowUpForm} className="dashboard-note-form">
            <input type="hidden" name="leadId" value={lead.id} />
            <label className="form-field">
              <span>
                <AdminFieldLabel label="Assign admin" tooltip={adminTooltips.leadDetail.assignAdmin} />
              </span>
              <select name="assignedAdminId" defaultValue={lead.assigned_admin_id ?? "none"}>
                <option value="none">Unassigned</option>
                {adminProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name ?? profile.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>
                <AdminFieldLabel label="First response template" tooltip={adminTooltips.leadDetail.firstResponseTemplate} />
              </span>
              <select name="firstResponseTemplateId" defaultValue={selectedTemplateId}>
                <option value="">Not selected</option>
                {firstResponseTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label} ({template.channel})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>
                <AdminFieldLabel label="Follow-up due at" tooltip={adminTooltips.leadDetail.followUpDueAt} />
              </span>
              <input
                type="datetime-local"
                name="followUpDueAt"
                defaultValue={formatDatetimeLocalValue(lead.follow_up_due_at)}
              />
            </label>
            <label className="form-field">
              <span>Assigned admin notes</span>
              <textarea name="assignedAdminNotes" rows={3} defaultValue={lead.assigned_admin_notes ?? ""} maxLength={1000} />
            </label>
            <label className="form-field">
              <span>
                <AdminFieldLabel label="Response marked sent at (optional)" tooltip={adminTooltips.leadDetail.firstResponseSent} />
              </span>
              <input
                type="datetime-local"
                name="firstResponseSentAt"
                defaultValue={formatDatetimeLocalValue(lead.first_response_sent_at)}
              />
            </label>
            <button type="submit" className="button button-secondary">
              Save follow-up fields
            </button>
          </form>
        </section>
      </div>
      <section className="dashboard-panel">
        <h2>Update status</h2>
        <p className="dashboard-inline-note dashboard-status-next">{leadStatusWorkflowLine}</p>
        <p className="dashboard-inline-note">
          <strong>Do this next:</strong> {nextStepCopy}
          {recommendedStatus ? (
            <>
              {" "}
              Recommended status: <strong>{leadStatusLabels[recommendedStatus]}</strong>
              {recommendedStatus === "enrolled" && !lead.client_id ? " (via Accept & invite below)" : null}.
            </>
          ) : null}{" "}
          <AdminHelpTooltip text={adminTooltips.leadDetail.statusWorkflow} label="Status workflow" />
        </p>
        {error === "invite-required" ? (
          <p className="form-error">Use “Accept & invite client” to enrol this lead. Status alone cannot create portal access.</p>
        ) : null}
        <div className="dashboard-status-actions">
          {leadStatusOptions.filter((status) => status !== "enrolled" || Boolean(lead.client_id)).map((status) => (
            <form key={status} action={updateLeadStatusForm}>
              <input type="hidden" name="leadId" value={lead.id} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                className={`button button-small ${
                  lead.status === status
                    ? "button-primary"
                    : recommendedStatus === status
                      ? "button-secondary dashboard-status-recommended"
                      : "button-secondary"
                }`}
              >
                {leadStatusLabels[status]}
              </button>
            </form>
          ))}
        </div>
        {canInviteLead(lead) ? (
          <p className="dashboard-inline-note">
            <Link
              href={`/admin/clients/invite/?leadId=${lead.id}`}
              className="button button-primary"
              title={adminTooltips.leadDetail.acceptInvite}
            >
              Accept & invite client
            </Link>{" "}
            <AdminHelpTooltip text={adminTooltips.leadDetail.acceptInvite} label="Accept and invite" />
          </p>
        ) : lead.client_id ? (
          <p className="dashboard-inline-note">
            Already enrolled.{" "}
            <Link href={`/admin/clients/`} className="button button-small button-secondary">
              Browse clients
            </Link>
          </p>
        ) : null}
      </section>
      <section className="dashboard-panel">
        <h2>
          Internal notes{" "}
          <AdminHelpTooltip text={adminTooltips.leadDetail.internalNotes} label="Internal notes" />
        </h2>
        <form action={addLeadNote} className="dashboard-note-form">
          <input type="hidden" name="leadId" value={lead.id} />
          <label className="form-field">
            <span>Add a private note</span>
            <textarea name="body" rows={4} maxLength={dashboardFieldMaxLengths.noteBody} required />
          </label>
          <button type="submit" className="button button-primary">
            Save note
          </button>
        </form>
        {notes?.length ? (
          <ul className="dashboard-note-list">
            {notes.map((note) => (
              <li key={note.id}>
                <p>{note.body}</p>
                <p className="dashboard-note-meta">
                  {(note.profiles as { full_name?: string | null } | null)?.full_name ?? "Admin"} ·{" "}
                  {formatDashboardDate(note.created_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dashboard-empty">
            No notes yet. After each call or WhatsApp, save one sentence so follow-up is not only in your inbox.
          </p>
        )}
      </section>
    </div>
  );
}


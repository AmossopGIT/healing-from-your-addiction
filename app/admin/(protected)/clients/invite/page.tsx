import type { Metadata } from "next";
import { programmes } from "@/content/programmes";
import { contactMethods } from "@/lib/constants";
import { inviteClient } from "@/lib/dashboard/inviteClient";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Invite Client | Admin",
  description: "Invite a client to the private portal.",
  path: "/admin/clients/invite/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ leadId?: string; error?: string }> };

const inviteErrorMessages: Record<string, string> = {
  "missing-fields": "Please complete the full name and email fields.",
  "invalid-name": "Please enter a valid full name.",
  "invalid-programme": "Please choose a valid programme focus.",
  "invalid-contact-method": "Please choose a valid preferred contact method.",
  "supabase-not-configured": "Supabase is not configured for client invitations yet.",
  "invite-failed": "The invitation could not be sent. Please try again.",
};

export default async function InviteClientPage({ searchParams }: PageProps) {
  const { leadId, error } = await searchParams;
  const supabase = await createClient();

  let lead = null;
  if (leadId) {
    const { data } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
    lead = data;
  }

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Client onboarding</p>
        <h1>Invite client</h1>
        <p>Send a secure email invitation so the client can set a password and access their portal.</p>
      </section>
      {error ? <p className="form-error">{inviteErrorMessages[error] ?? decodeURIComponent(error)}</p> : null}
      {lead ? (
        <section className="dashboard-panel">
          <h2>Lead handoff summary</h2>
          <dl className="dashboard-dl">
            <div><dt>Concern</dt><dd>{lead.addiction_concern}</dd></div>
            <div><dt>Urgency</dt><dd>{lead.urgency_level ?? "—"}</dd></div>
            <div><dt>Withdrawal support level</dt><dd>{lead.withdrawal_risk ?? "—"}</dd></div>
            <div><dt>Medical support involved</dt><dd>{lead.medical_support_involved ?? "—"}</dd></div>
            <div><dt>Support goals</dt><dd>{lead.support_goals ?? "—"}</dd></div>
            <div><dt>Preferred callback window</dt><dd>{lead.callback_window ?? "—"}</dd></div>
          </dl>
        </section>
      ) : null}
      <section className="dashboard-panel">
        <form action={inviteClient} className="dashboard-form">
          <input type="hidden" name="leadId" value={leadId ?? ""} />
          <input type="hidden" name="handoffSummary" value={lead ? `${lead.addiction_concern} | urgency:${lead.urgency_level ?? "na"} | withdrawal:${lead.withdrawal_risk ?? "na"} | goals:${lead.support_goals ?? "na"}` : ""} />
          <label className="form-field">
            <span>Full name</span>
            <input
              name="fullName"
              required
              minLength={2}
              maxLength={leadFieldMaxLengths.fullName}
              defaultValue={lead?.full_name ?? ""}
            />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              maxLength={leadFieldMaxLengths.email}
              defaultValue={lead?.email ?? ""}
            />
          </label>
          <label className="form-field">
            <span>Addiction focus</span>
            <select name="addictionSlug" defaultValue="">
              <option value="">Select programme focus</option>
              {programmes.map((programme) => (
                <option key={programme.slug} value={programme.slug}>{programme.title}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Preferred contact method</span>
            <select name="preferredContactMethod" defaultValue={lead?.preferred_contact_method ?? ""}>
              <option value="">Select method</option>
              {contactMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="button button-primary">Send invitation</button>
        </form>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { programmes } from "@/content/programmes";
import { contactMethods } from "@/lib/constants";
import { inviteClient } from "@/lib/dashboard/inviteClient";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Invite Client | Admin",
  description: "Invite a client to the private portal.",
  path: "/admin/clients/invite/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ leadId?: string; error?: string }> };

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
      {error ? <p className="form-error">{decodeURIComponent(error)}</p> : null}
      <section className="dashboard-panel">
        <form action={inviteClient} className="dashboard-form">
          <input type="hidden" name="leadId" value={leadId ?? ""} />
          <label className="form-field"><span>Full name</span><input name="fullName" required defaultValue={lead?.full_name ?? ""} /></label>
          <label className="form-field"><span>Email</span><input name="email" type="email" required defaultValue={lead?.email ?? ""} /></label>
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

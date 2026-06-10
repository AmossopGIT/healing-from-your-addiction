import type { Metadata } from "next";
import { ReadOnView } from "@/components/dashboard/ReadOnView";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { sendClientMessage } from "@/lib/dashboard/programmeActions";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { getClientMessages } from "@/lib/dashboard/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Messages | Client Portal",
  description: "Secure messages with your therapist.",
  path: "/portal/messages/",
  noIndex: true,
});

export default async function PortalMessagesPage() {
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;
  const messages = clientProfile ? await getClientMessages(clientProfile.id) : [];

  return (
    <div className="dashboard-stack">
      {clientProfile ? <ReadOnView endpoint="/api/portal/messages/read/" /> : null}
      <section className="dashboard-page-header">
        <p className="eyebrow">Messages</p>
        <h1>Secure messages</h1>
        <p>Private messages between you and Gerald. You will receive an email when Gerald replies. Not for emergencies.</p>
      </section>
      <section className="dashboard-panel">
        {clientProfile ? (
          <form action={sendClientMessage} className="dashboard-note-form">
            <input type="hidden" name="clientProfileId" value={clientProfile.id} />
            <input type="hidden" name="redirectTo" value="/portal/messages/" />
            <label className="form-field">
              <span>Your message</span>
              <textarea name="body" rows={4} maxLength={dashboardFieldMaxLengths.messageBody} required />
            </label>
            <button type="submit" className="button button-primary">Send message</button>
          </form>
        ) : null}
        <ul className="dashboard-message-list">
          {messages.map((message) => (
            <li key={message.id} className={(message.profiles as { role?: string } | null)?.role === "admin" ? "message-admin" : "message-client"}>
              <p>{message.body}</p>
              <p className="dashboard-note-meta">{(message.profiles as { full_name?: string | null } | null)?.full_name ?? "User"} · {formatDashboardDate(message.created_at)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
